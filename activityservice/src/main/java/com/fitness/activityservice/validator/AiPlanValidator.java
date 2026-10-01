package com.fitness.activityservice.validator;

import com.fitness.activityservice.dto.ai.AiPlanValidationResult;
import com.fitness.activityservice.dto.ai.AiRawDayDto;
import com.fitness.activityservice.dto.ai.AiRawExerciseDto;
import com.fitness.activityservice.dto.ai.AiRawPlanDto;
import com.fitness.activityservice.model.Exercise;
import com.fitness.activityservice.service.ExerciseCatalogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class AiPlanValidator {

    private final ExerciseCatalogService exerciseCatalogService;

    /**
     * Kiểm tra tính hợp lệ của kế hoạch tuần do Gemini trả về.
     *
     * @param rawPlan        Dữ liệu plan thô từ AI
     * @param selectedDays   Các ngày người dùng chọn tập (1 = T2 ... 7 = CN)
     * @param userEquipment  Dụng cụ người dùng sở hữu
     * @param userExperience Trình độ người dùng (BEGINNER, INTERMEDIATE, ADVANCED)
     * @return Kết quả kiểm tra (Valid hoặc danh sách lỗi REJECT)
     */
    public AiPlanValidationResult validate(
            AiRawPlanDto rawPlan,
            List<Integer> selectedDays,
            List<String> userEquipment,
            String userExperience) {

        List<String> errors = new ArrayList<>();

        if (rawPlan == null) {
            return AiPlanValidationResult.fail("Raw plan must not be null");
        }

        List<AiRawDayDto> days = rawPlan.getDays();
        if (days == null || days.isEmpty()) {
            return AiPlanValidationResult.fail("Plan must contain days");
        }

        Set<Integer> selectedDaySet = selectedDays != null ? new HashSet<>(selectedDays) : Collections.emptySet();

        for (AiRawDayDto day : days) {
            Integer dayIndex = day.getDayIndex();
            if (dayIndex == null || dayIndex < 1 || dayIndex > 7) {
                errors.add("Invalid dayIndex: " + dayIndex);
                continue;
            }

            boolean isScheduled = selectedDaySet.contains(dayIndex);

            if (isScheduled) {
                // 1. Ngày tập theo lịch (Scheduled Day)
                if (Boolean.TRUE.equals(day.getIsRestDay())) {
                    errors.add("Scheduled day " + dayIndex + " must not be marked as rest day");
                }

                List<AiRawExerciseDto> exercises = day.getExercises();
                // Rule 5: Scheduled day empty -> REJECT
                if (exercises == null || exercises.isEmpty()) {
                    errors.add("Scheduled day " + dayIndex + " must not be empty");
                    continue;
                }

                // Check 3 Phases: Rule 6, 7, 8
                boolean hasWarmup = false;
                boolean hasMain = false;
                boolean hasCooldown = false;

                for (AiRawExerciseDto ex : exercises) {
                    if (ex.getPhase() != null) {
                        String phase = ex.getPhase().trim().toUpperCase();
                        if ("WARMUP".equals(phase)) hasWarmup = true;
                        else if ("MAIN".equals(phase)) hasMain = true;
                        else if ("COOLDOWN".equals(phase)) hasCooldown = true;
                    }

                    // Validate từng bài tập với Exercise Catalog
                    validateExercise(ex, userEquipment, userExperience, errors);
                }

                if (!hasWarmup) {
                    errors.add("Scheduled day " + dayIndex + " is missing WARMUP phase");
                }
                if (!hasMain) {
                    errors.add("Scheduled day " + dayIndex + " is missing MAIN phase");
                }
                if (!hasCooldown) {
                    errors.add("Scheduled day " + dayIndex + " is missing COOLDOWN phase");
                }

            } else {
                // 2. Ngày nghỉ (Rest Day)
                // Rule 9: Rest day has exercise -> REJECT
                if (day.getExercises() != null && !day.getExercises().isEmpty()) {
                    errors.add("Rest day " + dayIndex + " must not contain any exercises");
                }
                if (Boolean.FALSE.equals(day.getIsRestDay())) {
                    errors.add("Rest day " + dayIndex + " must be marked as isRestDay=true");
                }
            }
        }

        if (errors.isEmpty()) {
            return AiPlanValidationResult.success();
        } else {
            log.warn("AiPlanValidator rejected plan with {} errors: {}", errors.size(), errors);
            return AiPlanValidationResult.fail(errors);
        }
    }

    /**
     * Ném ngoại lệ nếu kết quả kiểm tra không hợp lệ.
     */
    public void validateOrThrow(
            AiRawPlanDto rawPlan,
            List<Integer> selectedDays,
            List<String> userEquipment,
            String userExperience) {

        AiPlanValidationResult result = validate(rawPlan, selectedDays, userEquipment, userExperience);
        if (!result.isValid()) {
            throw new AiPlanValidationException(result.getErrors());
        }
    }

    private void validateExercise(
            AiRawExerciseDto ex,
            List<String> userEquipment,
            String userExperience,
            List<String> errors) {

        String code = ex.getExerciseCode();
        if (code == null || code.trim().isEmpty()) {
            errors.add("Exercise code must not be blank");
            return;
        }

        // Rule 2: Unknown exercise -> REJECT, không fallback
        Optional<Exercise> exerciseOpt = exerciseCatalogService.getExerciseByCode(code);
        if (exerciseOpt.isEmpty()) {
            errors.add("Unknown exercise code: " + code + ". Rejecting without fallback.");
            return;
        }

        Exercise catalogExercise = exerciseOpt.get();

        // Rule 3: Wrong equipment -> REJECT
        if (!isEquipmentAllowed(userEquipment, catalogExercise.getEquipment())) {
            errors.add(String.format("Exercise %s requires equipment %s which is not supported by user equipment %s",
                    code, catalogExercise.getEquipment(), userEquipment));
        }

        // Rule 4: Wrong difficulty hierarchy -> REJECT
        if (!isDifficultyAllowed(userExperience, catalogExercise.getDifficulty())) {
            errors.add(String.format("Exercise %s difficulty %s exceeds user experience level %s",
                    code, catalogExercise.getDifficulty(), userExperience));
        }
    }

    /**
     * Quy tắc phân cấp Difficulty Hierarchy:
     * - BEGINNER: chỉ nhận BEGINNER
     * - INTERMEDIATE: nhận BEGINNER + INTERMEDIATE
     * - ADVANCED: nhận BEGINNER + INTERMEDIATE + ADVANCED
     */
    private boolean isDifficultyAllowed(String userExperience, String exerciseDifficulty) {
        if (userExperience == null || exerciseDifficulty == null) {
            return false;
        }
        String exp = userExperience.trim().toUpperCase();
        String diff = exerciseDifficulty.trim().toUpperCase();

        return switch (exp) {
            case "BEGINNER" -> "BEGINNER".equals(diff);
            case "INTERMEDIATE" -> "BEGINNER".equals(diff) || "INTERMEDIATE".equals(diff);
            case "ADVANCED" -> "BEGINNER".equals(diff) || "INTERMEDIATE".equals(diff) || "ADVANCED".equals(diff);
            default -> false;
        };
    }

    /**
     * Dụng cụ bài tập yêu cầu phải là tập con của dụng cụ người dùng có.
     */
    private boolean isEquipmentAllowed(List<String> userEquipment, List<String> exerciseEquipment) {
        if (exerciseEquipment == null || exerciseEquipment.isEmpty()) {
            return true;
        }
        if (userEquipment == null || userEquipment.isEmpty()) {
            return false;
        }

        Set<String> userEquipSet = userEquipment.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .map(String::toUpperCase)
                .collect(Collectors.toSet());

        for (String req : exerciseEquipment) {
            if (req != null && !userEquipSet.contains(req.trim().toUpperCase())) {
                return false;
            }
        }
        return true;
    }
}
