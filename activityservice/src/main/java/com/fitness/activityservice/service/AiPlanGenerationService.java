package com.fitness.activityservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fitness.activityservice.ai.GeminiClient;
import com.fitness.activityservice.ai.GeminiPromptBuilder;
import com.fitness.activityservice.dto.UserProfileDto;
import com.fitness.activityservice.dto.WeeklyHistorySummaryDto;
import com.fitness.activityservice.dto.WeeklyPlanDto;
import com.fitness.activityservice.dto.WorkoutDayDto;
import com.fitness.activityservice.dto.WorkoutExerciseDto;
import com.fitness.activityservice.dto.ai.AiGeneratePlanRequest;
import com.fitness.activityservice.dto.ai.AiRawDayDto;
import com.fitness.activityservice.dto.ai.AiRawExerciseDto;
import com.fitness.activityservice.dto.ai.AiRawPlanDto;
import com.fitness.activityservice.dto.ai.TargetWeekDto;
import com.fitness.activityservice.model.Exercise;
import com.fitness.activityservice.validator.AiPlanValidationException;
import com.fitness.activityservice.validator.AiPlanValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiPlanGenerationService {

    private final GeminiPromptBuilder promptBuilder;
    private final GeminiClient geminiClient;
    private final ObjectMapper objectMapper;
    private final AiPlanValidator aiPlanValidator;
    private final ExerciseCatalogService exerciseCatalogService;
    private final VideoResolver videoResolver;

    private static final Map<Integer, String> DAY_NAMES = Map.of(
            1, "T2",
            2, "T3",
            3, "T4",
            4, "T5",
            5, "T6",
            6, "T7",
            7, "CN"
    );

    /**
     * Chu trình sinh kế hoạch tuần AI thích ứng hoàn chỉnh (F05 Flow):
     * Profile + History
     *        ↓
     * PromptBuilder
     *        ↓
     * GeminiClient
     *        ↓
     * Parse JSON
     *        ↓
     * AiPlanValidator (Single Source of Truth)
     *        ↓
     * ExerciseCatalog (Tên chuẩn hóa tiếng Việt, nhóm cơ)
     *        ↓
     * VideoResolver (Ghép video clip YouTube)
     *        ↓
     * WeeklyPlanDto (Trạng thái Preview, isActive = false)
     */
    public WeeklyPlanDto generateWeeklyPlan(AiGeneratePlanRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("AiGeneratePlanRequest must not be null");
        }
        return generateWeeklyPlan(request.getUserProfile(), request.getPreviousWeekSummary(), request.getTargetWeek());
    }

    public WeeklyPlanDto generateWeeklyPlan(
            UserProfileDto profile,
            WeeklyHistorySummaryDto history,
            TargetWeekDto targetWeek) {

        log.info("Starting AI Weekly Plan Generation for user: {}", profile != null ? profile.getUserId() : "unknown");

        // 1. Xác định khung thời gian tuần mục tiêu
        LocalDate startDate;
        LocalDate endDate;
        if (targetWeek != null && targetWeek.getStartDate() != null && targetWeek.getEndDate() != null) {
            startDate = targetWeek.getStartDate();
            endDate = targetWeek.getEndDate();
        } else {
            // Mặc định: Tuần kế tiếp từ Thứ Hai đến Chủ Nhật
            startDate = LocalDate.now().with(TemporalAdjusters.next(DayOfWeek.MONDAY));
            endDate = startDate.plusDays(6);
        }

        // 2. Lấy danh sách Allowed Exercise Codes từ Catalog
        List<String> allowedCodes = exerciseCatalogService.getAllExerciseCodes();
        if (allowedCodes.isEmpty()) {
            exerciseCatalogService.initCatalogIfEmpty();
            allowedCodes = exerciseCatalogService.getAllExerciseCodes();
        }

        // 3. Xây dựng prompt chuẩn hóa
        String prompt = promptBuilder.buildPrompt(profile, history, startDate, endDate, allowedCodes);

        // 4. Gọi GeminiClient để nhận Raw JSON (GeminiClient KHÔNG tự validate)
        String rawJson = geminiClient.generateRawPlan(prompt);

        // 5. Parse Raw JSON thành AiRawPlanDto
        AiRawPlanDto rawPlan = parseRawPlan(rawJson);

        // 6. AiPlanValidator: Độc lập kiểm tra business rules nghiêm ngặt (Source of Truth)
        List<Integer> selectedDays = (profile != null && profile.getSelectedDays() != null && !profile.getSelectedDays().isEmpty())
                ? profile.getSelectedDays()
                : List.of(1, 3, 5);

        List<String> userEquipment = (profile != null && profile.getEquipment() != null && !profile.getEquipment().isEmpty())
                ? new ArrayList<>(profile.getEquipment())
                : List.of("BODYWEIGHT");

        String userExperience = (profile != null && profile.getExperience() != null)
                ? profile.getExperience()
                : "BEGINNER";

        aiPlanValidator.validateOrThrow(rawPlan, selectedDays, userEquipment, userExperience);

        // 7. Tra cứu Catalog & VideoResolver để ghép dữ liệu hoàn chỉnh
        List<WorkoutDayDto> workoutDays = assembleWorkoutDays(rawPlan, selectedDays, userEquipment, userExperience, startDate);

        // 8. Đóng gói WeeklyPlanDto Preview (isActive = false)
        String userId = profile != null ? (profile.getUserId() != null ? profile.getUserId() : profile.getKeycloakId()) : null;
        String goal = (rawPlan.getGoal() != null && !rawPlan.getGoal().isBlank())
                ? rawPlan.getGoal()
                : (profile != null && profile.getFitnessGoal() != null ? profile.getFitnessGoal() : "GENERAL_FITNESS");

        String duration = (profile != null && profile.getWorkoutDuration() != null)
                ? profile.getWorkoutDuration()
                : (rawPlan.getDurationPerSession() != null ? rawPlan.getDurationPerSession() : "30-45");

        String overview = (rawPlan.getWeeklyOverview() != null && !rawPlan.getWeeklyOverview().isBlank())
                ? rawPlan.getWeeklyOverview()
                : "Kế hoạch tập luyện 7 ngày cá nhân hóa do AI điều chỉnh.";

        String coachTip = (rawPlan.getCoachTip() != null && !rawPlan.getCoachTip().isBlank())
                ? rawPlan.getCoachTip()
                : "Hãy duy trì kỷ luật, khởi động kỹ và bổ sung đủ nước trong mỗi buổi tập!";

        WeeklyPlanDto previewPlan = WeeklyPlanDto.builder()
                .id("preview-" + UUID.randomUUID().toString().substring(0, 8))
                .userId(userId)
                .goal(goal)
                .level(userExperience)
                .durationPerSession(duration)
                .frequencyPerWeek(selectedDays.size())
                .weeklyOverview(overview)
                .coachTip(coachTip)
                .startDate(startDate)
                .endDate(endDate)
                .isActive(false) // Preview mode, chưa lưu vào active plan
                .days(workoutDays)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        log.info("AI Weekly Plan Generation completed successfully with {} days.", previewPlan.getDays().size());
        return previewPlan;
    }

    private AiRawPlanDto parseRawPlan(String rawJson) {
        try {
            return objectMapper.readValue(rawJson, AiRawPlanDto.class);
        } catch (Exception e) {
            log.error("Failed to parse Gemini raw response as AiRawPlanDto: {}", rawJson, e);
            throw new AiPlanValidationException(List.of("Gemini returned invalid JSON structure: " + e.getMessage()));
        }
    }

    private List<WorkoutDayDto> assembleWorkoutDays(
            AiRawPlanDto rawPlan,
            List<Integer> selectedDays,
            List<String> userEquipment,
            String userExperience,
            LocalDate startDate) {

        Set<Integer> selectedDaySet = new HashSet<>(selectedDays);
        Map<Integer, AiRawDayDto> rawDayMap = new HashMap<>();

        if (rawPlan.getDays() != null) {
            for (AiRawDayDto day : rawPlan.getDays()) {
                if (day.getDayIndex() != null) {
                    rawDayMap.put(day.getDayIndex(), day);
                }
            }
        }

        List<WorkoutDayDto> assembledDays = new ArrayList<>();

        for (int dayIndex = 1; dayIndex <= 7; dayIndex++) {
            LocalDate dayDate = startDate.plusDays(dayIndex - 1);
            String dayName = DAY_NAMES.getOrDefault(dayIndex, "T" + dayIndex);
            AiRawDayDto rawDay = rawDayMap.get(dayIndex);

            boolean isScheduled = selectedDaySet.contains(dayIndex);

            if (isScheduled) {
                // Scheduled Day
                List<WorkoutExerciseDto> exercises = new ArrayList<>();
                int totalMinutes = 0;

                if (rawDay != null && rawDay.getExercises() != null) {
                    int orderIndex = 1;
                    for (AiRawExerciseDto rawEx : rawDay.getExercises()) {
                        // Tra cứu Catalog lấy tên chính thức (không để AI tự đặt tên)
                        Optional<Exercise> catalogExOpt = exerciseCatalogService.getExerciseByCode(rawEx.getExerciseCode());
                        String officialName = catalogExOpt.map(Exercise::getName).orElse(rawEx.getExerciseCode());

                        // Ghép video clip từ Video Catalog
                        String videoId = videoResolver.resolveVideoId(rawEx.getExerciseCode(), userExperience, userEquipment);

                        int dur = rawEx.getDurationMinutes() != null ? rawEx.getDurationMinutes() : 10;
                        totalMinutes += dur;

                        exercises.add(WorkoutExerciseDto.builder()
                                .phase(rawEx.getPhase() != null ? rawEx.getPhase().toUpperCase() : "MAIN")
                                .name(officialName)
                                .durationMinutes(dur)
                                .youtubeVideoId(videoId)
                                .order(rawEx.getOrder() != null ? rawEx.getOrder() : orderIndex++)
                                .build());
                    }
                }

                String focus = (rawDay != null && rawDay.getFocus() != null && !rawDay.getFocus().isBlank())
                        ? rawDay.getFocus()
                        : "Toàn thân";

                String intensity = (rawDay != null && rawDay.getIntensity() != null)
                        ? rawDay.getIntensity()
                        : "Moderate";

                assembledDays.add(WorkoutDayDto.builder()
                        .dayIndex(dayIndex)
                        .dayName(dayName)
                        .date(dayDate)
                        .focus(focus)
                        .intensity(intensity)
                        .totalMinutes(rawDay != null && rawDay.getTotalMinutes() != null && rawDay.getTotalMinutes() > 0 ? rawDay.getTotalMinutes() : totalMinutes)
                        .isRestDay(false)
                        .status("NOT_STARTED")
                        .exercises(exercises)
                        .build());

            } else {
                // Rest Day
                assembledDays.add(WorkoutDayDto.builder()
                        .dayIndex(dayIndex)
                        .dayName(dayName)
                        .date(dayDate)
                        .focus("Rest & Recovery")
                        .intensity("Low")
                        .totalMinutes(0)
                        .isRestDay(true)
                        .status("REST")
                        .exercises(Collections.emptyList())
                        .build());
            }
        }

        return assembledDays;
    }
}
