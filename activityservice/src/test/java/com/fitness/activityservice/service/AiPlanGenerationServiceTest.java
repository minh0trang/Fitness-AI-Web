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
import com.fitness.activityservice.dto.ai.TargetWeekDto;
import com.fitness.activityservice.model.Exercise;
import com.fitness.activityservice.model.ExerciseVideo;
import com.fitness.activityservice.repository.ExerciseRepository;
import com.fitness.activityservice.repository.ExerciseVideoRepository;
import com.fitness.activityservice.validator.AiPlanValidationException;
import com.fitness.activityservice.validator.AiPlanValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AiPlanGenerationServiceTest {

    @Mock
    private GeminiClient geminiClient;

    @Mock
    private ExerciseRepository exerciseRepository;

    @Mock
    private ExerciseVideoRepository exerciseVideoRepository;

    private ExerciseCatalogService exerciseCatalogService;
    private VideoResolver videoResolver;
    private AiPlanValidator aiPlanValidator;
    private GeminiPromptBuilder promptBuilder;
    private ObjectMapper objectMapper;

    private AiPlanGenerationService aiPlanGenerationService;

    private Exercise warmupEx;
    private Exercise pushupEx;
    private Exercise squatEx;
    private Exercise plankEx;
    private Exercise cooldownEx;
    private Exercise dumbbellEx;
    private Exercise bicycleCrunchEx;

    @BeforeEach
    void setUp() {
        exerciseCatalogService = new ExerciseCatalogService(exerciseRepository, exerciseVideoRepository);
        videoResolver = new VideoResolver(exerciseCatalogService);
        aiPlanValidator = new AiPlanValidator(exerciseCatalogService);
        promptBuilder = new GeminiPromptBuilder();
        objectMapper = new ObjectMapper();

        aiPlanGenerationService = new AiPlanGenerationService(
                promptBuilder,
                geminiClient,
                objectMapper,
                aiPlanValidator,
                exerciseCatalogService,
                videoResolver
        );

        // Chuẩn bị Mock Catalog
        warmupEx = Exercise.builder().id("ex-1").code("WARMUP_DYNAMIC_STRETCH").name("Khởi động khớp & Giãn cơ động").focus("Warmup").difficulty("BEGINNER").equipment(List.of("BODYWEIGHT")).build();
        pushupEx = Exercise.builder().id("ex-2").code("PUSH_UP").name("Hít đất cơ bản").focus("Chest").difficulty("BEGINNER").equipment(List.of("BODYWEIGHT")).build();
        squatEx = Exercise.builder().id("ex-3").code("BODYWEIGHT_SQUAT").name("Squat thể trọng cơ bản").focus("Legs").difficulty("BEGINNER").equipment(List.of("BODYWEIGHT")).build();
        plankEx = Exercise.builder().id("ex-4").code("PLANK_BASIC").name("Plank cẳng tay chuẩn form").focus("Core").difficulty("BEGINNER").equipment(List.of("BODYWEIGHT", "YOGA_MAT")).build();
        cooldownEx = Exercise.builder().id("ex-5").code("COOLDOWN_STATIC_STRETCH").name("Giãn cơ tĩnh & Hạ nhịp tim").focus("Cooldown").difficulty("BEGINNER").equipment(List.of("BODYWEIGHT", "YOGA_MAT")).build();
        dumbbellEx = Exercise.builder().id("ex-6").code("DUMBBELL_SHOULDER_PRESS").name("Đẩy vai tạ đơn").focus("Shoulders").difficulty("INTERMEDIATE").equipment(List.of("DUMBBELL")).build();
        bicycleCrunchEx = Exercise.builder().id("ex-7").code("BICYCLE_CRUNCH").name("Gập bụng đạp xe").focus("Core").difficulty("INTERMEDIATE").equipment(List.of("BODYWEIGHT", "YOGA_MAT")).build();

        List<Exercise> allExercises = List.of(warmupEx, pushupEx, squatEx, plankEx, cooldownEx, dumbbellEx, bicycleCrunchEx);
        lenient().when(exerciseRepository.findAll()).thenReturn(allExercises);

        lenient().when(exerciseRepository.findByCode("WARMUP_DYNAMIC_STRETCH")).thenReturn(Optional.of(warmupEx));
        lenient().when(exerciseRepository.findByCode("PUSH_UP")).thenReturn(Optional.of(pushupEx));
        lenient().when(exerciseRepository.findByCode("BODYWEIGHT_SQUAT")).thenReturn(Optional.of(squatEx));
        lenient().when(exerciseRepository.findByCode("PLANK_BASIC")).thenReturn(Optional.of(plankEx));
        lenient().when(exerciseRepository.findByCode("COOLDOWN_STATIC_STRETCH")).thenReturn(Optional.of(cooldownEx));
    }

    @Test
    @DisplayName("F05.4 End-to-End: Luồng tạo Plan hoàn chỉnh với Profile -> Gemini Mock -> Validator -> Catalog -> Video -> WeeklyPlanDto")
    void testGenerateWeeklyPlan_FullSuccessFlow() {
        // 1. User Profile: Tập T2(1), T4(3), T6(5)
        UserProfileDto profile = UserProfileDto.builder()
                .userId("kc-user-001")
                .fitnessGoal("FAT_LOSS")
                .experience("BEGINNER")
                .selectedDays(List.of(1, 3, 5))
                .equipment(Set.of("BODYWEIGHT", "YOGA_MAT"))
                .workoutDuration("30-45")
                .build();

        TargetWeekDto targetWeek = TargetWeekDto.builder()
                .startDate(LocalDate.of(2026, 10, 5))
                .endDate(LocalDate.of(2026, 10, 11))
                .build();

        AiGeneratePlanRequest request = AiGeneratePlanRequest.builder()
                .userProfile(profile)
                .targetWeek(targetWeek)
                .build();

        // 2. Mock Gemini response raw JSON
        String geminiRawJson = """
        {
          "goal": "Giảm mỡ toàn thân",
          "level": "BEGINNER",
          "durationPerSession": "30-45",
          "frequencyPerWeek": 3,
          "weeklyOverview": "Kế hoạch 3 buổi tập trung thể trọng và cơ lõi",
          "coachTip": "Khởi động kỹ trước mỗi hiệp và giữ thẳng lưng khi Plank!",
          "days": [
            {
              "dayIndex": 1,
              "dayName": "T2",
              "focus": "Thân trên",
              "intensity": "Moderate",
              "totalMinutes": 35,
              "isRestDay": false,
              "exercises": [
                {"phase": "WARMUP", "exerciseCode": "WARMUP_DYNAMIC_STRETCH", "durationMinutes": 5, "order": 1},
                {"phase": "MAIN", "exerciseCode": "PUSH_UP", "durationMinutes": 20, "order": 2},
                {"phase": "COOLDOWN", "exerciseCode": "COOLDOWN_STATIC_STRETCH", "durationMinutes": 10, "order": 3}
              ]
            },
            {
              "dayIndex": 2,
              "dayName": "T3",
              "focus": "Rest",
              "intensity": "Low",
              "totalMinutes": 0,
              "isRestDay": true,
              "exercises": []
            },
            {
              "dayIndex": 3,
              "dayName": "T4",
              "focus": "Thân dưới",
              "intensity": "Moderate",
              "totalMinutes": 35,
              "isRestDay": false,
              "exercises": [
                {"phase": "WARMUP", "exerciseCode": "WARMUP_DYNAMIC_STRETCH", "durationMinutes": 5, "order": 1},
                {"phase": "MAIN", "exerciseCode": "BODYWEIGHT_SQUAT", "durationMinutes": 20, "order": 2},
                {"phase": "COOLDOWN", "exerciseCode": "COOLDOWN_STATIC_STRETCH", "durationMinutes": 10, "order": 3}
              ]
            },
            {
              "dayIndex": 4,
              "dayName": "T5",
              "focus": "Rest",
              "intensity": "Low",
              "totalMinutes": 0,
              "isRestDay": true,
              "exercises": []
            },
            {
              "dayIndex": 5,
              "dayName": "T6",
              "focus": "Core & Abs",
              "intensity": "Moderate",
              "totalMinutes": 30,
              "isRestDay": false,
              "exercises": [
                {"phase": "WARMUP", "exerciseCode": "WARMUP_DYNAMIC_STRETCH", "durationMinutes": 5, "order": 1},
                {"phase": "MAIN", "exerciseCode": "PLANK_BASIC", "durationMinutes": 15, "order": 2},
                {"phase": "COOLDOWN", "exerciseCode": "COOLDOWN_STATIC_STRETCH", "durationMinutes": 10, "order": 3}
              ]
            },
            {
              "dayIndex": 6,
              "dayName": "T7",
              "focus": "Rest",
              "intensity": "Low",
              "totalMinutes": 0,
              "isRestDay": true,
              "exercises": []
            },
            {
              "dayIndex": 7,
              "dayName": "CN",
              "focus": "Rest",
              "intensity": "Low",
              "totalMinutes": 0,
              "isRestDay": true,
              "exercises": []
            }
          ]
        }
        """;

        when(geminiClient.generateRawPlan(anyString())).thenReturn(geminiRawJson);

        // 3. Mock Video Catalog matching
        ExerciseVideo pushupVideo = ExerciseVideo.builder()
                .exerciseCode("PUSH_UP")
                .youtubeVideoId("IODxDxX7oi4")
                .level("BEGINNER")
                .equipment(List.of("BODYWEIGHT"))
                .build();
        when(exerciseVideoRepository.findByExerciseCode("PUSH_UP")).thenReturn(List.of(pushupVideo));

        ExerciseVideo warmupVideo = ExerciseVideo.builder()
                .exerciseCode("WARMUP_DYNAMIC_STRETCH")
                .youtubeVideoId("y87vQ6kG70k")
                .level("BEGINNER")
                .equipment(List.of("BODYWEIGHT"))
                .build();
        when(exerciseVideoRepository.findByExerciseCode("WARMUP_DYNAMIC_STRETCH")).thenReturn(List.of(warmupVideo));

        // 4. Execute Service
        WeeklyPlanDto resultPlan = aiPlanGenerationService.generateWeeklyPlan(request);

        // 5. Assertions
        assertThat(resultPlan).isNotNull();
        assertThat(resultPlan.getIsActive()).isFalse(); // Strict Preview mode
        assertThat(resultPlan.getGoal()).isEqualTo("Giảm mỡ toàn thân");
        assertThat(resultPlan.getLevel()).isEqualTo("BEGINNER");
        assertThat(resultPlan.getWeeklyOverview()).contains("3 buổi");
        assertThat(resultPlan.getCoachTip()).contains("Khởi động kỹ");
        assertThat(resultPlan.getStartDate()).isEqualTo(LocalDate.of(2026, 10, 5));
        assertThat(resultPlan.getEndDate()).isEqualTo(LocalDate.of(2026, 10, 11));
        assertThat(resultPlan.getDays()).hasSize(7);

        // Check Scheduled Day 1 (T2)
        WorkoutDayDto day1 = resultPlan.getDays().get(0);
        assertThat(day1.getDayIndex()).isEqualTo(1);
        assertThat(day1.getDayName()).isEqualTo("T2");
        assertThat(day1.getIsRestDay()).isFalse();
        assertThat(day1.getExercises()).hasSize(3);

        // Exercise Name must come 100% from Exercise Catalog (not invented by AI)
        WorkoutExerciseDto ex1 = day1.getExercises().get(0);
        assertThat(ex1.getPhase()).isEqualTo("WARMUP");
        assertThat(ex1.getName()).isEqualTo("Khởi động khớp & Giãn cơ động");
        assertThat(ex1.getYoutubeVideoId()).isEqualTo("y87vQ6kG70k");

        WorkoutExerciseDto ex2 = day1.getExercises().get(1);
        assertThat(ex2.getPhase()).isEqualTo("MAIN");
        assertThat(ex2.getName()).isEqualTo("Hít đất cơ bản");
        assertThat(ex2.getYoutubeVideoId()).isEqualTo("IODxDxX7oi4");

        // Check Rest Day 2 (T3)
        WorkoutDayDto day2 = resultPlan.getDays().get(1);
        assertThat(day2.getDayIndex()).isEqualTo(2);
        assertThat(day2.getIsRestDay()).isTrue();
        assertThat(day2.getExercises()).isEmpty();
    }

    @Test
    @DisplayName("F05.4 Reject unknown exercise: Ném AiPlanValidationException khi Gemini trả về mã không có trong Catalog")
    void testGenerateWeeklyPlan_RejectUnknownExerciseCode() {
        UserProfileDto profile = UserProfileDto.builder()
                .userId("kc-user-002")
                .experience("BEGINNER")
                .selectedDays(List.of(1))
                .equipment(Set.of("BODYWEIGHT"))
                .build();

        String rawJsonWithUnknownCode = """
        {
          "goal": "Test Unknown",
          "days": [
            {
              "dayIndex": 1,
              "dayName": "T2",
              "isRestDay": false,
              "exercises": [
                {"phase": "WARMUP", "exerciseCode": "WARMUP_DYNAMIC_STRETCH", "durationMinutes": 5},
                {"phase": "MAIN", "exerciseCode": "BURPEE_SUPER_EXTREME", "durationMinutes": 20},
                {"phase": "COOLDOWN", "exerciseCode": "COOLDOWN_STATIC_STRETCH", "durationMinutes": 5}
              ]
            },
            {"dayIndex": 2, "isRestDay": true, "exercises": []},
            {"dayIndex": 3, "isRestDay": true, "exercises": []},
            {"dayIndex": 4, "isRestDay": true, "exercises": []},
            {"dayIndex": 5, "isRestDay": true, "exercises": []},
            {"dayIndex": 6, "isRestDay": true, "exercises": []},
            {"dayIndex": 7, "isRestDay": true, "exercises": []}
          ]
        }
        """;

        when(geminiClient.generateRawPlan(anyString())).thenReturn(rawJsonWithUnknownCode);
        when(exerciseRepository.findByCode("BURPEE_SUPER_EXTREME")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> aiPlanGenerationService.generateWeeklyPlan(profile, null, null))
                .isInstanceOf(AiPlanValidationException.class)
                .hasMessageContaining("Unknown exercise code: BURPEE_SUPER_EXTREME. Rejecting without fallback.");
    }

    @Test
    @DisplayName("F05.4 Reject wrong equipment: Ném ngoại lệ khi bài tập đòi hỏi tạ đơn nhưng người dùng chỉ có bodyweight")
    void testGenerateWeeklyPlan_RejectWrongEquipment() {
        UserProfileDto profile = UserProfileDto.builder()
                .userId("kc-user-003")
                .experience("INTERMEDIATE")
                .selectedDays(List.of(1))
                .equipment(Set.of("BODYWEIGHT")) // Không có DUMBBELL
                .build();

        String rawJsonWithDumbbell = """
        {
          "goal": "Test Equipment",
          "days": [
            {
              "dayIndex": 1,
              "isRestDay": false,
              "exercises": [
                {"phase": "WARMUP", "exerciseCode": "WARMUP_DYNAMIC_STRETCH", "durationMinutes": 5},
                {"phase": "MAIN", "exerciseCode": "DUMBBELL_SHOULDER_PRESS", "durationMinutes": 20},
                {"phase": "COOLDOWN", "exerciseCode": "COOLDOWN_STATIC_STRETCH", "durationMinutes": 5}
              ]
            },
            {"dayIndex": 2, "isRestDay": true, "exercises": []},
            {"dayIndex": 3, "isRestDay": true, "exercises": []},
            {"dayIndex": 4, "isRestDay": true, "exercises": []},
            {"dayIndex": 5, "isRestDay": true, "exercises": []},
            {"dayIndex": 6, "isRestDay": true, "exercises": []},
            {"dayIndex": 7, "isRestDay": true, "exercises": []}
          ]
        }
        """;

        when(geminiClient.generateRawPlan(anyString())).thenReturn(rawJsonWithDumbbell);
        when(exerciseRepository.findByCode("DUMBBELL_SHOULDER_PRESS")).thenReturn(Optional.of(dumbbellEx));

        assertThatThrownBy(() -> aiPlanGenerationService.generateWeeklyPlan(profile, null, null))
                .isInstanceOf(AiPlanValidationException.class)
                .hasMessageContaining("requires equipment [DUMBBELL] which is not supported by user equipment [BODYWEIGHT]");
    }

    @Test
    @DisplayName("F05.4 Reject difficulty hierarchy: Ném ngoại lệ khi người dùng BEGINNER bị giao bài INTERMEDIATE")
    void testGenerateWeeklyPlan_RejectDifficultyHierarchy() {
        UserProfileDto profile = UserProfileDto.builder()
                .userId("kc-user-004")
                .experience("BEGINNER") // BEGINNER chỉ được nhận BEGINNER
                .selectedDays(List.of(1))
                .equipment(Set.of("BODYWEIGHT", "YOGA_MAT"))
                .build();

        String rawJsonWithIntermediateExercise = """
        {
          "goal": "Test Difficulty",
          "days": [
            {
              "dayIndex": 1,
              "isRestDay": false,
              "exercises": [
                {"phase": "WARMUP", "exerciseCode": "WARMUP_DYNAMIC_STRETCH", "durationMinutes": 5},
                {"phase": "MAIN", "exerciseCode": "BICYCLE_CRUNCH", "durationMinutes": 20},
                {"phase": "COOLDOWN", "exerciseCode": "COOLDOWN_STATIC_STRETCH", "durationMinutes": 5}
              ]
            },
            {"dayIndex": 2, "isRestDay": true, "exercises": []},
            {"dayIndex": 3, "isRestDay": true, "exercises": []},
            {"dayIndex": 4, "isRestDay": true, "exercises": []},
            {"dayIndex": 5, "isRestDay": true, "exercises": []},
            {"dayIndex": 6, "isRestDay": true, "exercises": []},
            {"dayIndex": 7, "isRestDay": true, "exercises": []}
          ]
        }
        """;

        when(geminiClient.generateRawPlan(anyString())).thenReturn(rawJsonWithIntermediateExercise);
        when(exerciseRepository.findByCode("BICYCLE_CRUNCH")).thenReturn(Optional.of(bicycleCrunchEx));

        assertThatThrownBy(() -> aiPlanGenerationService.generateWeeklyPlan(profile, null, null))
                .isInstanceOf(AiPlanValidationException.class)
                .hasMessageContaining("difficulty INTERMEDIATE exceeds user experience level BEGINNER");
    }

    @Test
    @DisplayName("F05.4 Reject malformed JSON: Ném AiPlanValidationException khi phản hồi không parse được JSON")
    void testGenerateWeeklyPlan_RejectMalformedJson() {
        UserProfileDto profile = UserProfileDto.builder()
                .userId("kc-user-005")
                .build();

        when(geminiClient.generateRawPlan(anyString())).thenReturn("This is not valid json at all");

        assertThatThrownBy(() -> aiPlanGenerationService.generateWeeklyPlan(profile, null, null))
                .isInstanceOf(AiPlanValidationException.class)
                .hasMessageContaining("Gemini returned invalid JSON structure");
    }
}
