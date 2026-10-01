package com.fitness.activityservice.service;

import com.fitness.activityservice.dto.CreateWeeklyPlanRequest;
import com.fitness.activityservice.dto.WeeklyPlanDto;
import com.fitness.activityservice.dto.WorkoutDayDto;
import com.fitness.activityservice.dto.WorkoutExerciseDto;
import com.fitness.activityservice.model.ExercisePhase;
import com.fitness.activityservice.model.WeeklyPlan;
import com.fitness.activityservice.model.WorkoutDay;
import com.fitness.activityservice.model.WorkoutExercise;
import com.fitness.activityservice.repository.WeeklyPlanRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WeeklyPlanServiceTest {

    @Mock
    private WeeklyPlanRepository weeklyPlanRepository;

    @InjectMocks
    private WeeklyPlanService weeklyPlanService;

    private LocalDate monday;
    private LocalDate sunday;
    private WeeklyPlan samplePlan;

    @BeforeEach
    void setUp() {
        monday = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        sunday = monday.plusDays(6);

        WorkoutExercise ex1 = WorkoutExercise.builder()
                .phase(ExercisePhase.WARMUP)
                .name("Khởi động khớp")
                .durationMinutes(5)
                .youtubeVideoId("vid_warmup_1")
                .order(1)
                .build();

        WorkoutExercise ex2 = WorkoutExercise.builder()
                .phase(ExercisePhase.MAIN)
                .name("Core Plank & Crunch")
                .durationMinutes(25)
                .youtubeVideoId("vid_main_1")
                .order(2)
                .build();

        WorkoutExercise ex3 = WorkoutExercise.builder()
                .phase(ExercisePhase.COOLDOWN)
                .name("Giãn cơ sâu")
                .durationMinutes(10)
                .youtubeVideoId("vid_cool_1")
                .order(3)
                .build();

        WorkoutDay day1 = WorkoutDay.builder()
                .dayIndex(1)
                .dayName("T2")
                .date(monday)
                .focus("Core")
                .intensity("Moderate")
                .totalMinutes(40)
                .isRestDay(false)
                .exercises(Arrays.asList(ex1, ex2, ex3))
                .build();

        WorkoutDay day2 = WorkoutDay.builder()
                .dayIndex(2)
                .dayName("T3")
                .date(monday.plusDays(1))
                .focus("Rest")
                .intensity("Rest")
                .totalMinutes(0)
                .isRestDay(true)
                .exercises(Collections.emptyList())
                .build();

        samplePlan = WeeklyPlan.builder()
                .id("plan-12345")
                .userId("user-alex-1")
                .goal("Giảm vòng eo")
                .level("Beginner")
                .durationPerSession("30-45")
                .frequencyPerWeek(5)
                .weeklyOverview("Tuần này: 5 buổi · ~190 phút · Core · Lower Body")
                .coachTip("Ưu tiên bài tập ít va đập")
                .startDate(monday)
                .endDate(sunday)
                .trainingStartDate(monday)
                .isActive(false)
                .days(Arrays.asList(day1, day2))
                .build();
    }

    @Test
    @DisplayName("createPreviewPlan - Tạo plan mới luôn ở trạng thái PREVIEW (isActive = false)")
    void testCreatePreviewPlan_AlwaysInactive() {
        CreateWeeklyPlanRequest request = CreateWeeklyPlanRequest.builder()
                .goal("Giảm vòng eo")
                .level("Beginner")
                .durationPerSession("30-45")
                .frequencyPerWeek(5)
                .startDate(monday)
                .endDate(sunday)
                .days(Collections.singletonList(
                        WorkoutDayDto.builder()
                                .dayIndex(1)
                                .dayName("T2")
                                .focus("Core")
                                .intensity("Moderate")
                                .totalMinutes(40)
                                .isRestDay(false)
                                .exercises(Collections.singletonList(
                                        WorkoutExerciseDto.builder()
                                                .phase("MAIN")
                                                .name("Crunch")
                                                .durationMinutes(20)
                                                .youtubeVideoId("abc1234")
                                                .order(1)
                                                .build()
                                ))
                                .build()
                ))
                .build();

        when(weeklyPlanRepository.save(any(WeeklyPlan.class))).thenAnswer(invocation -> {
            WeeklyPlan p = invocation.getArgument(0);
            p.setId("plan-generated-1");
            return p;
        });

        WeeklyPlanDto result = weeklyPlanService.createPreviewPlan("user-alex-1", request);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo("plan-generated-1");
        assertThat(result.getUserId()).isEqualTo("user-alex-1");
        assertThat(result.getIsActive()).isFalse(); // Create != Apply
        assertThat(result.getDays()).hasSize(1);
        assertThat(result.getDays().get(0).getExercises()).hasSize(1);

        verify(weeklyPlanRepository, times(1)).save(any(WeeklyPlan.class));
    }

    @Test
    @DisplayName("applyPlan - Chuyển plan từ PREVIEW sang ACTIVE và deactivate plan cũ")
    void testApplyPlan_Success() {
        WeeklyPlan oldActivePlan = WeeklyPlan.builder()
                .id("old-plan-active")
                .userId("user-alex-1")
                .isActive(true)
                .build();

        when(weeklyPlanRepository.findById("plan-12345")).thenReturn(Optional.of(samplePlan));
        when(weeklyPlanRepository.findByUserIdAndIsActive("user-alex-1", true))
                .thenReturn(Collections.singletonList(oldActivePlan));
        when(weeklyPlanRepository.save(any(WeeklyPlan.class))).thenAnswer(invocation -> invocation.getArgument(0));

        WeeklyPlanDto result = weeklyPlanService.applyPlan("user-alex-1", "plan-12345");

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo("plan-12345");
        assertThat(result.getIsActive()).isTrue();
        assertThat(result.getActivatedAt()).isNotNull();

        // Old plan must be deactivated
        assertThat(oldActivePlan.getIsActive()).isFalse();
        verify(weeklyPlanRepository, atLeast(2)).save(any(WeeklyPlan.class));
    }

    @Test
    @DisplayName("applyPlan - Ném ngoại lệ khi user không sở hữu plan")
    void testApplyPlan_Unauthorized() {
        when(weeklyPlanRepository.findById("plan-12345")).thenReturn(Optional.of(samplePlan));

        assertThatThrownBy(() -> weeklyPlanService.applyPlan("other-user-999", "plan-12345"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("does not belong to user");
    }

    @Test
    @DisplayName("applyAsNew - Copy plan cũ thành plan mới cho tuần hiện tại mà không sửa plan cũ")
    void testApplyAsNew_DeepCopySuccess() {
        WeeklyPlan oldHistoryPlan = WeeklyPlan.builder()
                .id("plan-history-week1")
                .userId("user-alex-1")
                .goal("Giảm mỡ toàn thân")
                .level("Beginner")
                .durationPerSession("30-45")
                .frequencyPerWeek(4)
                .startDate(monday.minusWeeks(2))
                .endDate(sunday.minusWeeks(2))
                .isActive(false)
                .days(samplePlan.getDays())
                .build();

        when(weeklyPlanRepository.findById("plan-history-week1")).thenReturn(Optional.of(oldHistoryPlan));
        when(weeklyPlanRepository.findByUserIdAndIsActive("user-alex-1", true)).thenReturn(Collections.emptyList());
        when(weeklyPlanRepository.save(any(WeeklyPlan.class))).thenAnswer(invocation -> {
            WeeklyPlan p = invocation.getArgument(0);
            p.setId("plan-copied-new");
            return p;
        });

        WeeklyPlanDto result = weeklyPlanService.applyAsNew("user-alex-1", "plan-history-week1");

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo("plan-copied-new");
        assertThat(result.getIsActive()).isTrue();
        assertThat(result.getStartDate()).isEqualTo(monday);
        assertThat(result.getEndDate()).isEqualTo(sunday);

        // Old plan was NOT modified
        assertThat(oldHistoryPlan.getId()).isEqualTo("plan-history-week1");
        assertThat(oldHistoryPlan.getIsActive()).isFalse();
    }

    @Test
    @DisplayName("getActivePlan - Tính toán trạng thái động cho từng ngày tập (Dynamic Status)")
    void testGetActivePlan_DynamicStatusComputation() {
        samplePlan.setIsActive(true);
        samplePlan.setTrainingStartDate(monday.plusDays(2)); // Mid-week onboarding: Bắt đầu từ Thứ 4

        when(weeklyPlanRepository.findByUserIdAndIsActiveTrue("user-alex-1")).thenReturn(Optional.of(samplePlan));

        WeeklyPlanDto result = weeklyPlanService.getActivePlan("user-alex-1");

        assertThat(result).isNotNull();
        assertThat(result.getIsActive()).isTrue();

        // Day 1 (T2): Trước trainingStartDate -> NOT_STARTED (không bị tính là MISSED)
        assertThat(result.getDays().get(0).getStatus()).isEqualTo("NOT_STARTED");

        // Day 2 (T3): Ngày nghỉ -> REST
        assertThat(result.getDays().get(1).getStatus()).isEqualTo("REST");
    }
}
