package com.fitness.activityservice.service;

import com.fitness.activityservice.dto.WorkoutJournalRequest;
import com.fitness.activityservice.dto.WorkoutJournalResponse;
import com.fitness.activityservice.model.WorkoutJournal;
import com.fitness.activityservice.repository.WeeklyPlanRepository;
import com.fitness.activityservice.repository.WorkoutJournalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class WorkoutJournalService {

    private final WorkoutJournalRepository workoutJournalRepository;
    private final WeeklyPlanRepository weeklyPlanRepository;

    /**
     * Submit or update post-workout journal entry.
     * Idempotency rule: userId + planId + dayIndex is unique.
     * Re-submitting on the same dayIndex updates the existing journal.
     */
    public WorkoutJournalResponse recordJournal(String userId, WorkoutJournalRequest request) {
        log.info("Recording workout journal for userId: {}, planId: {}, dayIndex: {}",
                userId, request.getPlanId(), request.getDayIndex());

        // 1. Validate plan existence
        if (!weeklyPlanRepository.existsById(request.getPlanId())) {
            throw new IllegalArgumentException("WeeklyPlan not found for id: " + request.getPlanId());
        }

        // 2. Validate difficulty and energy ranges
        if (request.getDifficulty() == null || request.getDifficulty() < 1 || request.getDifficulty() > 5) {
            throw new IllegalArgumentException("Difficulty must be between 1 and 5");
        }
        if (request.getEnergy() == null || request.getEnergy() < 1 || request.getEnergy() > 5) {
            throw new IllegalArgumentException("Energy must be between 1 and 5");
        }
        if (request.getDayIndex() == null || request.getDayIndex() < 1 || request.getDayIndex() > 7) {
            throw new IllegalArgumentException("DayIndex must be between 1 and 7");
        }

        // 3. Rule: If hasPain is false or null, painLocations must be empty
        List<String> effectivePainLocations = new ArrayList<>();
        if (Boolean.TRUE.equals(request.getHasPain()) && request.getPainLocations() != null) {
            effectivePainLocations = new ArrayList<>(request.getPainLocations());
        }

        // 4. Rule: No binary / base64 image data in MongoDB
        String photoUrl = request.getPhotoUrl();
        if (photoUrl != null && photoUrl.trim().toLowerCase().startsWith("data:image")) {
            throw new IllegalArgumentException("Direct Base64 binary image uploads are not allowed. Please provide an Object Storage URL.");
        }

        LocalDate workoutDate = request.getWorkoutDate() != null ? request.getWorkoutDate() : LocalDate.now();

        // 5. Idempotent check: Find existing journal for (userId + planId + dayIndex)
        WorkoutJournal journal = workoutJournalRepository
                .findByUserIdAndPlanIdAndDayIndex(userId, request.getPlanId(), request.getDayIndex())
                .orElse(null);

        if (journal == null) {
            journal = WorkoutJournal.builder()
                    .userId(userId)
                    .planId(request.getPlanId())
                    .dayIndex(request.getDayIndex())
                    .createdAt(LocalDateTime.now())
                    .build();
        }

        journal.setWorkoutTitle(request.getWorkoutTitle());
        journal.setWorkoutDate(workoutDate);
        journal.setCompletedAt(LocalDateTime.now());
        journal.setActualDurationMinutes(request.getActualDurationMinutes());
        journal.setPlannedDurationMinutes(request.getPlannedDurationMinutes());
        journal.setPlannedIntensity(request.getPlannedIntensity());
        journal.setCaloriesBurned(request.getCaloriesBurned());
        journal.setDifficulty(request.getDifficulty());
        journal.setEnergy(request.getEnergy());
        journal.setHasPain(Boolean.TRUE.equals(request.getHasPain()));
        journal.setPainLocations(effectivePainLocations);
        journal.setNotes(request.getNotes());
        journal.setPhotoUrl(photoUrl);
        journal.setUpdatedAt(LocalDateTime.now());

        WorkoutJournal saved = workoutJournalRepository.save(journal);
        log.info("Successfully saved workout journal with id: {}", saved.getId());

        return mapToResponse(saved);
    }

    /**
     * Get specific journal by ID for the authenticated user.
     */
    public WorkoutJournalResponse getJournalById(String userId, String journalId) {
        WorkoutJournal journal = workoutJournalRepository.findById(journalId)
                .orElseThrow(() -> new IllegalArgumentException("Workout journal not found: " + journalId));

        if (!userId.equals(journal.getUserId())) {
            throw new IllegalArgumentException("Unauthorized access to journal: " + journalId);
        }

        return mapToResponse(journal);
    }

    /**
     * Get all journals for a specific weekly plan.
     */
    public List<WorkoutJournalResponse> getJournalsByPlan(String userId, String planId) {
        return workoutJournalRepository.findByUserIdAndPlanId(userId, planId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get all journals for the authenticated user (strictly using X-User-ID).
     */
    public List<WorkoutJournalResponse> getUserJournals(String userId) {
        return workoutJournalRepository.findByUserIdOrderByWorkoutDateDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private WorkoutJournalResponse mapToResponse(WorkoutJournal journal) {
        return WorkoutJournalResponse.builder()
                .id(journal.getId())
                .userId(journal.getUserId())
                .planId(journal.getPlanId())
                .dayIndex(journal.getDayIndex())
                .workoutTitle(journal.getWorkoutTitle())
                .workoutDate(journal.getWorkoutDate())
                .completedAt(journal.getCompletedAt())
                .actualDurationMinutes(journal.getActualDurationMinutes())
                .plannedDurationMinutes(journal.getPlannedDurationMinutes())
                .plannedIntensity(journal.getPlannedIntensity())
                .caloriesBurned(journal.getCaloriesBurned())
                .difficulty(journal.getDifficulty())
                .energy(journal.getEnergy())
                .hasPain(journal.getHasPain())
                .painLocations(journal.getPainLocations())
                .notes(journal.getNotes())
                .photoUrl(journal.getPhotoUrl())
                .createdAt(journal.getCreatedAt())
                .updatedAt(journal.getUpdatedAt())
                .build();
    }
}
