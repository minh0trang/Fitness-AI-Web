package com.fitness.activityservice.validator;

import com.fitness.activityservice.dto.ai.AiPlanValidationResult;
import com.fitness.activityservice.dto.ai.AiRawDayDto;
import com.fitness.activityservice.dto.ai.AiRawExerciseDto;
import com.fitness.activityservice.dto.ai.AiRawPlanDto;
import com.fitness.activityservice.model.Exercise;
import com.fitness.activityservice.service.ExerciseCatalogService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AiPlanValidatorTest {

    @Mock
    private ExerciseCatalogService exerciseCatalogService;

    @InjectMocks
    private AiPlanValidator aiPlanValidator;

    private List<Integer> selectedDays;
    private List<String> userEquipment;
    private String userExperience;

    private Exercise warmupEx;
    private Exercise mainPushUpEx;
    private Exercise mainDumbbellPressEx;
    private Exercise advancedPistolSquatEx;
    private Exercise cooldownEx;

    @BeforeEach
    void setUp() {
        // User tập các ngày T2 (1), T3 (2), T5 (4), T6 (5), CN (7)
        // Ngày nghỉ: T4 (3), T7 (6)
        selectedDays = List.of(1, 2, 4, 5, 7);
        userEquipment = List.of("BODYWEIGHT", "YOGA_MAT");
        userExperience = "BEGINNER";

        warmupEx = Exercise.builder()
                .code("WARMUP_DYNAMIC_STRETCH")
                .name("Khởi động động")
                .difficulty("BEGINNER")
                .equipment(List.of("BODYWEIGHT"))
                .build();

        mainPushUpEx = Exercise.builder()
                .code("PUSH_UP")
                .name("Hít đất cơ bản")
                .difficulty("BEGINNER")
                .equipment(List.of("BODYWEIGHT"))
                .build();

        mainDumbbellPressEx = Exercise.builder()
                .code("DUMBBELL_SHOULDER_PRESS")
                .name("Đẩy vai tạ đơn")
                .difficulty("BEGINNER")
                .equipment(List.of("DUMBBELL"))
                .build();

        advancedPistolSquatEx = Exercise.builder()
                .code("PISTOL_SQUAT")
                .name("Squat 1 chân nâng cao")
                .difficulty("ADVANCED")
                .equipment(List.of("BODYWEIGHT"))
                .build();

        cooldownEx = Exercise.builder()
                .code("COOLDOWN_STATIC_STRETCH")
                .name("Giãn cơ tĩnh")
                .difficulty("BEGINNER")
                .equipment(List.of("BODYWEIGHT", "YOGA_MAT"))
                .build();
    }

    private AiRawPlanDto createValidPlan() {
        List<AiRawDayDto> days = new ArrayList<>();

        for (int i = 1; i <= 7; i++) {
            if (selectedDays.contains(i)) {
                days.add(AiRawDayDto.builder()
                        .dayIndex(i)
                        .dayName("Day " + i)
                        .isRestDay(false)
                        .exercises(List.of(
                                AiRawExerciseDto.builder().phase("WARMUP").exerciseCode("WARMUP_DYNAMIC_STRETCH").durationMinutes(5).build(),
                                AiRawExerciseDto.builder().phase("MAIN").exerciseCode("PUSH_UP").durationMinutes(20).build(),
                                AiRawExerciseDto.builder().phase("COOLDOWN").exerciseCode("COOLDOWN_STATIC_STRETCH").durationMinutes(5).build()
                        ))
                        .build());
            } else {
                days.add(AiRawDayDto.builder()
                        .dayIndex(i)
                        .dayName("Day " + i)
                        .isRestDay(true)
                        .exercises(Collections.emptyList())
                        .build());
            }
        }

        return AiRawPlanDto.builder()
                .goal("Fat Loss")
                .level("BEGINNER")
                .days(days)
                .build();
    }

    private void mockStandardCatalog() {
        when(exerciseCatalogService.getExerciseByCode("WARMUP_DYNAMIC_STRETCH")).thenReturn(Optional.of(warmupEx));
        when(exerciseCatalogService.getExerciseByCode("PUSH_UP")).thenReturn(Optional.of(mainPushUpEx));
        when(exerciseCatalogService.getExerciseByCode("COOLDOWN_STATIC_STRETCH")).thenReturn(Optional.of(cooldownEx));
    }

    @Test
    @DisplayName("Test 1: Valid plan -> PASS")
    void test1_ValidPlan_Passes() {
        mockStandardCatalog();
        AiRawPlanDto plan = createValidPlan();

        AiPlanValidationResult result = aiPlanValidator.validate(plan, selectedDays, userEquipment, userExperience);

        assertThat(result.isValid()).isTrue();
        assertThat(result.getErrors()).isEmpty();
    }

    @Test
    @DisplayName("Test 2: Unknown exercise -> REJECT (không fallback)")
    void test2_UnknownExercise_Rejects() {
        when(exerciseCatalogService.getExerciseByCode("WARMUP_DYNAMIC_STRETCH")).thenReturn(Optional.of(warmupEx));
        when(exerciseCatalogService.getExerciseByCode("UNKNOWN_CODE_XYZ")).thenReturn(Optional.empty());

        AiRawPlanDto plan = createValidPlan();
        // Thay đổi bài tập ngày 1 thành mã lạ
        plan.getDays().get(0).getExercises().get(1).setExerciseCode("UNKNOWN_CODE_XYZ");

        AiPlanValidationResult result = aiPlanValidator.validate(plan, selectedDays, userEquipment, userExperience);

        assertThat(result.isValid()).isFalse();
        assertThat(result.getErrors()).anyMatch(e -> e.contains("Unknown exercise code: UNKNOWN_CODE_XYZ"));
    }

    @Test
    @DisplayName("Test 3: Wrong equipment -> REJECT (User chỉ có BODYWEIGHT nhưng bài yêu cầu DUMBBELL)")
    void test3_WrongEquipment_Rejects() {
        when(exerciseCatalogService.getExerciseByCode("WARMUP_DYNAMIC_STRETCH")).thenReturn(Optional.of(warmupEx));
        when(exerciseCatalogService.getExerciseByCode("DUMBBELL_SHOULDER_PRESS")).thenReturn(Optional.of(mainDumbbellPressEx));

        AiRawPlanDto plan = createValidPlan();
        // Ngày 1 dùng bài tập tạ
        plan.getDays().get(0).getExercises().get(1).setExerciseCode("DUMBBELL_SHOULDER_PRESS");

        AiPlanValidationResult result = aiPlanValidator.validate(plan, selectedDays, userEquipment, userExperience);

        assertThat(result.isValid()).isFalse();
        assertThat(result.getErrors()).anyMatch(e -> e.contains("requires equipment [DUMBBELL]"));
    }

    @Test
    @DisplayName("Test 4: Beginner + Advanced -> REJECT (User BEGINNER bị giao bài ADVANCED)")
    void test4_BeginnerPlusAdvanced_Rejects() {
        when(exerciseCatalogService.getExerciseByCode("WARMUP_DYNAMIC_STRETCH")).thenReturn(Optional.of(warmupEx));
        when(exerciseCatalogService.getExerciseByCode("PISTOL_SQUAT")).thenReturn(Optional.of(advancedPistolSquatEx));

        AiRawPlanDto plan = createValidPlan();
        // Ngày 1 dùng bài ADVANCED
        plan.getDays().get(0).getExercises().get(1).setExerciseCode("PISTOL_SQUAT");

        AiPlanValidationResult result = aiPlanValidator.validate(plan, selectedDays, userEquipment, userExperience);

        assertThat(result.isValid()).isFalse();
        assertThat(result.getErrors()).anyMatch(e -> e.contains("difficulty ADVANCED exceeds user experience level BEGINNER"));
    }

    @Test
    @DisplayName("Test 5: Scheduled day empty -> REJECT")
    void test5_ScheduledDayEmpty_Rejects() {
        mockStandardCatalog();
        AiRawPlanDto plan = createValidPlan();
        // Ngày 1 là scheduled day nhưng bị xóa hết bài tập
        plan.getDays().get(0).setExercises(Collections.emptyList());

        AiPlanValidationResult result = aiPlanValidator.validate(plan, selectedDays, userEquipment, userExperience);

        assertThat(result.isValid()).isFalse();
        assertThat(result.getErrors()).anyMatch(e -> e.contains("Scheduled day 1 must not be empty"));
    }

    @Test
    @DisplayName("Test 6: Missing WARMUP -> REJECT")
    void test6_MissingWarmup_Rejects() {
        when(exerciseCatalogService.getExerciseByCode("PUSH_UP")).thenReturn(Optional.of(mainPushUpEx));
        when(exerciseCatalogService.getExerciseByCode("COOLDOWN_STATIC_STRETCH")).thenReturn(Optional.of(cooldownEx));

        AiRawPlanDto plan = createValidPlan();
        // Bỏ WARMUP ở ngày 1 (chỉ còn MAIN và COOLDOWN)
        plan.getDays().get(0).setExercises(List.of(
                AiRawExerciseDto.builder().phase("MAIN").exerciseCode("PUSH_UP").build(),
                AiRawExerciseDto.builder().phase("COOLDOWN").exerciseCode("COOLDOWN_STATIC_STRETCH").build()
        ));

        AiPlanValidationResult result = aiPlanValidator.validate(plan, selectedDays, userEquipment, userExperience);

        assertThat(result.isValid()).isFalse();
        assertThat(result.getErrors()).anyMatch(e -> e.contains("Scheduled day 1 is missing WARMUP phase"));
    }

    @Test
    @DisplayName("Test 7: Missing MAIN -> REJECT")
    void test7_MissingMain_Rejects() {
        when(exerciseCatalogService.getExerciseByCode("WARMUP_DYNAMIC_STRETCH")).thenReturn(Optional.of(warmupEx));
        when(exerciseCatalogService.getExerciseByCode("COOLDOWN_STATIC_STRETCH")).thenReturn(Optional.of(cooldownEx));

        AiRawPlanDto plan = createValidPlan();
        // Bỏ MAIN ở ngày 1 (chỉ còn WARMUP và COOLDOWN)
        plan.getDays().get(0).setExercises(List.of(
                AiRawExerciseDto.builder().phase("WARMUP").exerciseCode("WARMUP_DYNAMIC_STRETCH").build(),
                AiRawExerciseDto.builder().phase("COOLDOWN").exerciseCode("COOLDOWN_STATIC_STRETCH").build()
        ));

        AiPlanValidationResult result = aiPlanValidator.validate(plan, selectedDays, userEquipment, userExperience);

        assertThat(result.isValid()).isFalse();
        assertThat(result.getErrors()).anyMatch(e -> e.contains("Scheduled day 1 is missing MAIN phase"));
    }

    @Test
    @DisplayName("Test 8: Missing COOLDOWN -> REJECT")
    void test8_MissingCooldown_Rejects() {
        when(exerciseCatalogService.getExerciseByCode("WARMUP_DYNAMIC_STRETCH")).thenReturn(Optional.of(warmupEx));
        when(exerciseCatalogService.getExerciseByCode("PUSH_UP")).thenReturn(Optional.of(mainPushUpEx));

        AiRawPlanDto plan = createValidPlan();
        // Bỏ COOLDOWN ở ngày 1 (chỉ còn WARMUP và MAIN)
        plan.getDays().get(0).setExercises(List.of(
                AiRawExerciseDto.builder().phase("WARMUP").exerciseCode("WARMUP_DYNAMIC_STRETCH").build(),
                AiRawExerciseDto.builder().phase("MAIN").exerciseCode("PUSH_UP").build()
        ));

        AiPlanValidationResult result = aiPlanValidator.validate(plan, selectedDays, userEquipment, userExperience);

        assertThat(result.isValid()).isFalse();
        assertThat(result.getErrors()).anyMatch(e -> e.contains("Scheduled day 1 is missing COOLDOWN phase"));
    }

    @Test
    @DisplayName("Test 9: Rest day has exercise -> REJECT")
    void test9_RestDayHasExercise_Rejects() {
        mockStandardCatalog();
        AiRawPlanDto plan = createValidPlan();
        // Ngày 3 là Rest Day (selectedDays không có 3), nhưng cố tình nhét bài tập vào
        AiRawDayDto restDay = plan.getDays().stream().filter(d -> d.getDayIndex() == 3).findFirst().get();
        restDay.setExercises(List.of(
                AiRawExerciseDto.builder().phase("MAIN").exerciseCode("PUSH_UP").build()
        ));

        AiPlanValidationResult result = aiPlanValidator.validate(plan, selectedDays, userEquipment, userExperience);

        assertThat(result.isValid()).isFalse();
        assertThat(result.getErrors()).anyMatch(e -> e.contains("Rest day 3 must not contain any exercises"));
    }

    @Test
    @DisplayName("validateOrThrow - Ném AiPlanValidationException khi plan không hợp lệ")
    void testValidateOrThrow_ThrowsException() {
        AiRawPlanDto plan = createValidPlan();
        plan.getDays().get(0).setExercises(Collections.emptyList());

        assertThatThrownBy(() -> aiPlanValidator.validateOrThrow(plan, selectedDays, userEquipment, userExperience))
                .isInstanceOf(AiPlanValidationException.class)
                .hasMessageContaining("Scheduled day 1 must not be empty");
    }
}
