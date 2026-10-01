package com.fitness.activityservice.service;

import com.fitness.activityservice.dto.WeeklyHistorySummaryDto;
import com.fitness.activityservice.model.WeeklyPlan;
import com.fitness.activityservice.model.WorkoutDay;
import com.fitness.activityservice.model.WorkoutJournal;
import com.fitness.activityservice.repository.WeeklyPlanRepository;
import com.fitness.activityservice.repository.WorkoutJournalRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WeeklyHistorySummaryServiceTest {

    @Mock
    private WeeklyPlanRepository weeklyPlanRepository;

    @Mock
    private WorkoutJournalRepository workoutJournalRepository;

    @InjectMocks
    private WeeklyHistorySummaryService weeklyHistorySummaryService;

    private WeeklyPlan samplePlan;

    @BeforeEach
    void setUp() {
        List<WorkoutDay> days = new ArrayList<>();
        // 5 scheduled days (40 min each = 200 min total target)
        days.add(WorkoutDay.builder().dayIndex(1).focus("Core").totalMinutes(40).isRestDay(false).build());
        days.add(WorkoutDay.builder().dayIndex(2).focus("Lower Body").totalMinutes(40).isRestDay(false).build());
        days.add(WorkoutDay.builder().dayIndex(3).focus("Rest").totalMinutes(0).isRestDay(true).build());
        days.add(WorkoutDay.builder().dayIndex(4).focus("Core").totalMinutes(40).isRestDay(false).build());
        days.add(WorkoutDay.builder().dayIndex(5).focus("Upper Body").totalMinutes(40).isRestDay(false).build());
        days.add(WorkoutDay.builder().dayIndex(6).focus("HIIT").totalMinutes(40).isRestDay(false).build());
        days.add(WorkoutDay.builder().dayIndex(7).focus("Rest").totalMinutes(0).isRestDay(true).build());

        samplePlan = WeeklyPlan.builder()
                .id("plan-week-1")
                .userId("user-kc-1")
                .startDate(LocalDate.of(2026, 9, 21))
                .endDate(LocalDate.of(2026, 9, 27))
                .days(days)
                .build();
    }

    @Test
    @DisplayName("Case 1: User mới chưa có tuần nào trước đó -> trả về Optional.empty()")
    void testPreviousWeekSummary_NoHistory_ReturnsEmpty() {
        when(weeklyPlanRepository.findFirstByUserIdAndEndDateBeforeOrderByEndDateDesc(eq("user-kc-1"), any(LocalDate.class)))
                .thenReturn(Optional.empty());

        Optional<WeeklyHistorySummaryDto> result = weeklyHistorySummaryService.getPreviousWeekSummary("user-kc-1");

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Case 2: 5 scheduled, 4 completed -> 80% completionRate, target 200m, actual 168m")
    void testPreviousWeekSummary_FullWeek_AggregatesCorrectly() {
        when(weeklyPlanRepository.findFirstByUserIdAndEndDateBeforeOrderByEndDateDesc(eq("user-kc-1"), any(LocalDate.class)))
                .thenReturn(Optional.of(samplePlan));

        List<WorkoutJournal> journals = Arrays.asList(
                WorkoutJournal.builder().dayIndex(1).actualDurationMinutes(42).difficulty(3).energy(4).build(),
                WorkoutJournal.builder().dayIndex(2).actualDurationMinutes(40).difficulty(4).energy(3).build(),
                WorkoutJournal.builder().dayIndex(4).actualDurationMinutes(45).difficulty(3).energy(4).build(),
                WorkoutJournal.builder().dayIndex(5).actualDurationMinutes(41).difficulty(3).energy(4).build()
        );

        when(workoutJournalRepository.findByUserIdAndPlanId("user-kc-1", "plan-week-1")).thenReturn(journals);

        Optional<WeeklyHistorySummaryDto> result = weeklyHistorySummaryService.getPreviousWeekSummary("user-kc-1");

        assertThat(result).isPresent();
        WeeklyHistorySummaryDto summary = result.get();
        assertThat(summary.getPlanId()).isEqualTo("plan-week-1");
        assertThat(summary.getTotalScheduledDays()).isEqualTo(5);
        assertThat(summary.getCompletedDays()).isEqualTo(4);
        assertThat(summary.getCompletionRate()).isEqualTo(80.0);
        assertThat(summary.getTargetMinutes()).isEqualTo(200);
        assertThat(summary.getActualMinutes()).isEqualTo(168);
    }

    @Test
    @DisplayName("Case 3: Pain Reports gom distinct và sorted chính xác từ các buổi có hasPain = true")
    void testPainReports_AggregatesDistinctAndSorted() {
        List<WorkoutJournal> journals = Arrays.asList(
                WorkoutJournal.builder().dayIndex(1).hasPain(true).painLocations(Collections.singletonList("KNEE_PAIN")).build(),
                WorkoutJournal.builder().dayIndex(2).hasPain(true).painLocations(Arrays.asList("KNEE_PAIN", "LOWER_BACK")).build(),
                WorkoutJournal.builder().dayIndex(4).hasPain(false).painLocations(Collections.emptyList()).build()
        );

        WeeklyHistorySummaryDto summary = weeklyHistorySummaryService.buildSummary(samplePlan, journals);

        assertThat(summary.getPainReports()).containsExactly("KNEE_PAIN", "LOWER_BACK");
    }

    @Test
    @DisplayName("Case 4: focusDistribution đếm chính xác theo WorkoutDay.focus và bỏ qua nếu không có focus")
    void testFocusDistribution_CountsCompletedWorkoutsByPlanFocus() {
        List<WorkoutJournal> journals = Arrays.asList(
                WorkoutJournal.builder().dayIndex(1).workoutTitle("Tập bụng tùy ý").build(), // day 1 focus is Core
                WorkoutJournal.builder().dayIndex(2).workoutTitle("Chân mông").build(),        // day 2 focus is Lower Body
                WorkoutJournal.builder().dayIndex(4).workoutTitle("Bụng nâng cao").build()    // day 4 focus is Core
        );

        WeeklyHistorySummaryDto summary = weeklyHistorySummaryService.buildSummary(samplePlan, journals);

        assertThat(summary.getFocusDistribution()).isNotNull();
        assertThat(summary.getFocusDistribution().get("Core")).isEqualTo(2);
        assertThat(summary.getFocusDistribution().get("Lower Body")).isEqualTo(1);
        assertThat(summary.getFocusDistribution()).doesNotContainKey("Tập bụng tùy ý"); // Không dùng workoutTitle fallback
    }

    @Test
    @DisplayName("Case 5: Điểm trung bình difficulty và energy làm tròn chính xác 1 chữ số thập phân")
    void testAverageDifficultyAndEnergy_CalculatedAndRoundedCorrectly() {
        List<WorkoutJournal> journals = Arrays.asList(
                WorkoutJournal.builder().dayIndex(1).difficulty(3).energy(4).build(),
                WorkoutJournal.builder().dayIndex(2).difficulty(4).energy(3).build(),
                WorkoutJournal.builder().dayIndex(4).difficulty(3).energy(5).build()
        );

        WeeklyHistorySummaryDto summary = weeklyHistorySummaryService.buildSummary(samplePlan, journals);

        // difficulty: (3 + 4 + 3) / 3 = 3.333... -> 3.3
        assertThat(summary.getAverageDifficulty()).isEqualTo(3.3);
        // energy: (4 + 3 + 5) / 3 = 4.0
        assertThat(summary.getAverageEnergy()).isEqualTo(4.0);
    }

    @Test
    @DisplayName("Case 6: Truy cập planId của người khác ném ngoại lệ bảo mật")
    void testGetSummaryByPlanId_UnauthorizedAccess_ThrowsException() {
        when(weeklyPlanRepository.findById("plan-week-1")).thenReturn(Optional.of(samplePlan));

        assertThatThrownBy(() -> weeklyHistorySummaryService.getSummaryByPlanId("other-user-999", "plan-week-1"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Unauthorized access");
    }
}
