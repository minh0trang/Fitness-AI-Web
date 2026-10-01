package com.fitness.activityservice.service;

import com.fitness.activityservice.dto.WorkoutJournalRequest;
import com.fitness.activityservice.dto.WorkoutJournalResponse;
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
import java.util.Arrays;
import java.util.Collections;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WorkoutJournalServiceTest {

    @Mock
    private WorkoutJournalRepository workoutJournalRepository;

    @Mock
    private WeeklyPlanRepository weeklyPlanRepository;

    @InjectMocks
    private WorkoutJournalService workoutJournalService;

    private WorkoutJournalRequest validRequest;

    @BeforeEach
    void setUp() {
        validRequest = WorkoutJournalRequest.builder()
                .planId("plan-123")
                .dayIndex(1)
                .workoutTitle("Core & Abs Blast")
                .workoutDate(LocalDate.now())
                .actualDurationMinutes(40)
                .plannedDurationMinutes(42)
                .plannedIntensity("Moderate")
                .caloriesBurned(200)
                .difficulty(3)
                .energy(4)
                .hasPain(true)
                .painLocations(Collections.singletonList("KNEE_PAIN"))
                .notes("Tập rất tốt")
                .photoUrl("https://storage.zerofitness.com/checkins/pic1.jpg")
                .build();
    }

    @Test
    @DisplayName("recordJournal - Lưu journal thành công khi planId tồn tại")
    void testRecordJournal_Success() {
        when(weeklyPlanRepository.existsById("plan-123")).thenReturn(true);
        when(workoutJournalRepository.findByUserIdAndPlanIdAndDayIndex("kc-user-1", "plan-123", 1))
                .thenReturn(Optional.empty());
        when(workoutJournalRepository.save(any(WorkoutJournal.class))).thenAnswer(invocation -> {
            WorkoutJournal j = invocation.getArgument(0);
            j.setId("j-001");
            return j;
        });

        WorkoutJournalResponse response = workoutJournalService.recordJournal("kc-user-1", validRequest);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo("j-001");
        assertThat(response.getUserId()).isEqualTo("kc-user-1");
        assertThat(response.getDifficulty()).isEqualTo(3);
        assertThat(response.getEnergy()).isEqualTo(4);
        assertThat(response.getHasPain()).isTrue();
        assertThat(response.getPainLocations()).contains("KNEE_PAIN");

        verify(workoutJournalRepository, times(1)).save(any(WorkoutJournal.class));
    }

    @Test
    @DisplayName("recordJournal - Ném IllegalArgumentException khi planId không tồn tại")
    void testRecordJournal_PlanNotFound() {
        when(weeklyPlanRepository.existsById("plan-non-existent")).thenReturn(false);
        validRequest.setPlanId("plan-non-existent");

        assertThatThrownBy(() -> workoutJournalService.recordJournal("kc-user-1", validRequest))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("WeeklyPlan not found");
    }

    @Test
    @DisplayName("recordJournal - Ném ngoại lệ khi difficulty nằm ngoài 1-5")
    void testRecordJournal_InvalidDifficulty() {
        when(weeklyPlanRepository.existsById("plan-123")).thenReturn(true);
        validRequest.setDifficulty(6);

        assertThatThrownBy(() -> workoutJournalService.recordJournal("kc-user-1", validRequest))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Difficulty must be between 1 and 5");
    }

    @Test
    @DisplayName("recordJournal - Ném ngoại lệ khi energy nằm ngoài 1-5")
    void testRecordJournal_InvalidEnergy() {
        when(weeklyPlanRepository.existsById("plan-123")).thenReturn(true);
        validRequest.setEnergy(0);

        assertThatThrownBy(() -> workoutJournalService.recordJournal("kc-user-1", validRequest))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Energy must be between 1 and 5");
    }

    @Test
    @DisplayName("recordJournal - hasPain = false tự động làm rỗng painLocations")
    void testRecordJournal_HasPainFalse_EmptiesPainLocations() {
        validRequest.setHasPain(false);
        validRequest.setPainLocations(Arrays.asList("KNEE_PAIN", "LOWER_BACK"));

        when(weeklyPlanRepository.existsById("plan-123")).thenReturn(true);
        when(workoutJournalRepository.findByUserIdAndPlanIdAndDayIndex("kc-user-1", "plan-123", 1))
                .thenReturn(Optional.empty());
        when(workoutJournalRepository.save(any(WorkoutJournal.class))).thenAnswer(invocation -> invocation.getArgument(0));

        WorkoutJournalResponse response = workoutJournalService.recordJournal("kc-user-1", validRequest);

        assertThat(response.getHasPain()).isFalse();
        assertThat(response.getPainLocations()).isEmpty();
    }

    @Test
    @DisplayName("recordJournal - Idempotency: Cập nhật journal cũ khi cùng userId, planId và dayIndex")
    void testRecordJournal_IdempotentUpdate() {
        WorkoutJournal existing = WorkoutJournal.builder()
                .id("j-existing-1")
                .userId("kc-user-1")
                .planId("plan-123")
                .dayIndex(1)
                .difficulty(2)
                .energy(3)
                .build();

        when(weeklyPlanRepository.existsById("plan-123")).thenReturn(true);
        when(workoutJournalRepository.findByUserIdAndPlanIdAndDayIndex("kc-user-1", "plan-123", 1))
                .thenReturn(Optional.of(existing));
        when(workoutJournalRepository.save(any(WorkoutJournal.class))).thenAnswer(invocation -> invocation.getArgument(0));

        WorkoutJournalResponse response = workoutJournalService.recordJournal("kc-user-1", validRequest);

        assertThat(response.getId()).isEqualTo("j-existing-1");
        assertThat(response.getDifficulty()).isEqualTo(3);
        assertThat(response.getEnergy()).isEqualTo(4);
    }

    @Test
    @DisplayName("recordJournal - Từ chối ảnh raw Base64, chỉ nhận URL")
    void testRecordJournal_RejectBase64Image() {
        when(weeklyPlanRepository.existsById("plan-123")).thenReturn(true);
        validRequest.setPhotoUrl("data:image/jpeg;base64,/9j/4AAQSkZJRgABA...");

        assertThatThrownBy(() -> workoutJournalService.recordJournal("kc-user-1", validRequest))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Direct Base64 binary image uploads are not allowed");
    }
}
