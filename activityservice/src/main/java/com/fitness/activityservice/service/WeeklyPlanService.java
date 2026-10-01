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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class WeeklyPlanService {

    private final WeeklyPlanRepository weeklyPlanRepository;

    /**
     * 1. Create Weekly Plan in PREVIEW state (isActive = false).
     * Rule: Create != Apply. Newly created plans are NEVER automatically activated.
     */
    public WeeklyPlanDto createPreviewPlan(String userId, CreateWeeklyPlanRequest request) {
        log.info("Creating preview weekly plan for userId: {}", userId);

        LocalDate startDate = request.getStartDate();
        if (startDate == null) {
            startDate = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        }
        LocalDate endDate = request.getEndDate();
        if (endDate == null) {
            endDate = startDate.plusDays(6);
        }

        final LocalDate effectiveStartDate = startDate;
        List<WorkoutDay> workoutDays = new ArrayList<>();
        if (request.getDays() != null) {
            workoutDays = request.getDays().stream()
                    .map(dto -> mapToEntity(dto, effectiveStartDate))
                    .collect(Collectors.toList());
        }

        WeeklyPlan plan = WeeklyPlan.builder()
                .userId(userId)
                .goal(request.getGoal())
                .level(request.getLevel())
                .durationPerSession(request.getDurationPerSession())
                .frequencyPerWeek(request.getFrequencyPerWeek())
                .weeklyOverview(request.getWeeklyOverview())
                .coachTip(request.getCoachTip())
                .startDate(startDate)
                .endDate(endDate)
                .trainingStartDate(request.getTrainingStartDate())
                .isActive(false) // ALWAYS PREVIEW
                .days(workoutDays)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        WeeklyPlan saved = weeklyPlanRepository.save(plan);
        log.info("Saved preview plan with id: {}, isActive={}", saved.getId(), saved.getIsActive());
        return mapToDto(saved);
    }

    /**
     * 2. User Accept/Apply Plan: Transition from PREVIEW to ACTIVE.
     * Rule: Only 1 active plan per user. Previous active plans are deactivated.
     */
    public WeeklyPlanDto applyPlan(String userId, String planId) {
        log.info("Applying plan {} for userId: {}", planId, userId);

        WeeklyPlan plan = weeklyPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found: " + planId));

        if (!userId.equals(plan.getUserId())) {
            throw new RuntimeException("Plan does not belong to user: " + userId);
        }

        // Deactivate any existing active plan
        deactivateUserPlans(userId);

        LocalDate today = LocalDate.now();
        plan.setIsActive(true);
        plan.setActivatedAt(LocalDateTime.now());
        if (plan.getTrainingStartDate() == null) {
            plan.setTrainingStartDate(today);
        }
        plan.setUpdatedAt(LocalDateTime.now());

        WeeklyPlan activePlan = weeklyPlanRepository.save(plan);
        log.info("Plan {} is now ACTIVE for userId {}", activePlan.getId(), userId);
        return mapToDto(activePlan);
    }

    /**
     * 3. Apply Old Plan as New (COPY on Reuse).
     * Rule: Old plan is immutable and preserved for history/audit.
     * A deep copy is created with current week boundaries and activated.
     */
    public WeeklyPlanDto applyAsNew(String userId, String oldPlanId) {
        log.info("Reusing old plan {} as new current week plan for userId: {}", oldPlanId, userId);

        WeeklyPlan oldPlan = weeklyPlanRepository.findById(oldPlanId)
                .orElseThrow(() -> new RuntimeException("Old plan not found: " + oldPlanId));

        // Determine current week Monday and Sunday
        LocalDate today = LocalDate.now();
        LocalDate monday = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate sunday = monday.plusDays(6);

        // Copy days and adjust dates to current week
        List<WorkoutDay> copiedDays = new ArrayList<>();
        if (oldPlan.getDays() != null) {
            copiedDays = oldPlan.getDays().stream()
                    .map(d -> {
                        LocalDate newDayDate = monday.plusDays(d.getDayIndex() != null ? d.getDayIndex() - 1 : 0);
                        List<WorkoutExercise> copiedExercises = new ArrayList<>();
                        if (d.getExercises() != null) {
                            copiedExercises = d.getExercises().stream()
                                    .map(e -> WorkoutExercise.builder()
                                            .phase(e.getPhase())
                                            .name(e.getName())
                                            .durationMinutes(e.getDurationMinutes())
                                            .youtubeVideoId(e.getYoutubeVideoId())
                                            .order(e.getOrder())
                                            .build())
                                    .collect(Collectors.toList());
                        }

                        return WorkoutDay.builder()
                                .dayIndex(d.getDayIndex())
                                .dayName(d.getDayName())
                                .date(newDayDate)
                                .focus(d.getFocus())
                                .intensity(d.getIntensity())
                                .totalMinutes(d.getTotalMinutes())
                                .isRestDay(d.getIsRestDay())
                                .exercises(copiedExercises)
                                .build();
                    })
                    .collect(Collectors.toList());
        }

        // Deactivate previous active plans
        deactivateUserPlans(userId);

        WeeklyPlan newPlan = WeeklyPlan.builder()
                .userId(userId)
                .goal(oldPlan.getGoal())
                .level(oldPlan.getLevel())
                .durationPerSession(oldPlan.getDurationPerSession())
                .frequencyPerWeek(oldPlan.getFrequencyPerWeek())
                .weeklyOverview(oldPlan.getWeeklyOverview())
                .coachTip(oldPlan.getCoachTip())
                .startDate(monday)
                .endDate(sunday)
                .trainingStartDate(today)
                .isActive(true)
                .activatedAt(LocalDateTime.now())
                .days(copiedDays)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        WeeklyPlan savedNewPlan = weeklyPlanRepository.save(newPlan);
        log.info("Created and activated new copied plan id: {} for current week {} to {}",
                savedNewPlan.getId(), monday, sunday);
        return mapToDto(savedNewPlan);
    }

    /**
     * 4. Get active plan for user with dynamically derived day statuses.
     */
    public WeeklyPlanDto getActivePlan(String userId) {
        WeeklyPlan plan = weeklyPlanRepository.findByUserIdAndIsActiveTrue(userId)
                .orElse(null);

        if (plan == null) return null;
        return mapToDto(plan);
    }

    /**
     * 5. Get plan by ID.
     */
    public WeeklyPlanDto getPlanById(String planId) {
        WeeklyPlan plan = weeklyPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found: " + planId));
        return mapToDto(plan);
    }

    private void deactivateUserPlans(String userId) {
        List<WeeklyPlan> activePlans = weeklyPlanRepository.findByUserIdAndIsActive(userId, true);
        for (WeeklyPlan p : activePlans) {
            p.setIsActive(false);
            p.setUpdatedAt(LocalDateTime.now());
            weeklyPlanRepository.save(p);
        }
    }

    private WorkoutDay mapToEntity(WorkoutDayDto dto, LocalDate weekStartDate) {
        LocalDate dayDate = dto.getDate();
        if (dayDate == null && dto.getDayIndex() != null && weekStartDate != null) {
            dayDate = weekStartDate.plusDays(dto.getDayIndex() - 1);
        }

        List<WorkoutExercise> exercises = new ArrayList<>();
        if (dto.getExercises() != null) {
            exercises = dto.getExercises().stream()
                    .map(e -> WorkoutExercise.builder()
                            .phase(parsePhase(e.getPhase()))
                            .name(e.getName())
                            .durationMinutes(e.getDurationMinutes())
                            .youtubeVideoId(e.getYoutubeVideoId())
                            .order(e.getOrder())
                            .build())
                    .collect(Collectors.toList());
        }

        return WorkoutDay.builder()
                .dayIndex(dto.getDayIndex())
                .dayName(dto.getDayName())
                .date(dayDate)
                .focus(dto.getFocus())
                .intensity(dto.getIntensity())
                .totalMinutes(dto.getTotalMinutes())
                .isRestDay(dto.getIsRestDay())
                .exercises(exercises)
                .build();
    }

    private ExercisePhase parsePhase(String phaseStr) {
        if (phaseStr == null) return ExercisePhase.MAIN;
        try {
            return ExercisePhase.valueOf(phaseStr.toUpperCase());
        } catch (Exception e) {
            return ExercisePhase.MAIN;
        }
    }

    public WeeklyPlanDto mapToDto(WeeklyPlan plan) {
        LocalDate today = LocalDate.now();
        LocalDate trainingStart = plan.getTrainingStartDate() != null ? plan.getTrainingStartDate() : plan.getStartDate();

        List<WorkoutDayDto> dayDtos = new ArrayList<>();
        if (plan.getDays() != null) {
            dayDtos = plan.getDays().stream()
                    .map(d -> {
                        String status;
                        if (Boolean.TRUE.equals(d.getIsRestDay())) {
                            status = "REST";
                        } else if (d.getDate() != null && trainingStart != null && d.getDate().isBefore(trainingStart)) {
                            // Mid-week onboarding: days before user joined are NOT counted as missed
                            status = "NOT_STARTED";
                        } else if (d.getDate() != null && d.getDate().isEqual(today)) {
                            status = "TODAY";
                        } else if (d.getDate() != null && d.getDate().isAfter(today)) {
                            status = "UPCOMING";
                        } else {
                            status = "UPCOMING"; // in F03, compared with workout_journals for COMPLETED / MISSED
                        }

                        List<WorkoutExerciseDto> exerciseDtos = new ArrayList<>();
                        if (d.getExercises() != null) {
                            exerciseDtos = d.getExercises().stream()
                                    .map(e -> WorkoutExerciseDto.builder()
                                            .phase(e.getPhase() != null ? e.getPhase().name() : "MAIN")
                                            .name(e.getName())
                                            .durationMinutes(e.getDurationMinutes())
                                            .youtubeVideoId(e.getYoutubeVideoId())
                                            .order(e.getOrder())
                                            .build())
                                    .collect(Collectors.toList());
                        }

                        return WorkoutDayDto.builder()
                                .dayIndex(d.getDayIndex())
                                .dayName(d.getDayName())
                                .date(d.getDate())
                                .focus(d.getFocus())
                                .intensity(d.getIntensity())
                                .totalMinutes(d.getTotalMinutes())
                                .isRestDay(d.getIsRestDay())
                                .status(status)
                                .exercises(exerciseDtos)
                                .build();
                    })
                    .collect(Collectors.toList());
        }

        return WeeklyPlanDto.builder()
                .id(plan.getId())
                .userId(plan.getUserId())
                .goal(plan.getGoal())
                .level(plan.getLevel())
                .durationPerSession(plan.getDurationPerSession())
                .frequencyPerWeek(plan.getFrequencyPerWeek())
                .weeklyOverview(plan.getWeeklyOverview())
                .coachTip(plan.getCoachTip())
                .startDate(plan.getStartDate())
                .endDate(plan.getEndDate())
                .trainingStartDate(plan.getTrainingStartDate())
                .isActive(plan.getIsActive())
                .activatedAt(plan.getActivatedAt())
                .days(dayDtos)
                .createdAt(plan.getCreatedAt())
                .updatedAt(plan.getUpdatedAt())
                .build();
    }
}
