package com.fitness.activityservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyPlanDto {
    private String id;
    private String userId;
    private String goal;
    private String level;
    private String durationPerSession;
    private Integer frequencyPerWeek;
    private String weeklyOverview;
    private String coachTip;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate trainingStartDate;
    private Boolean isActive;
    private LocalDateTime activatedAt;

    @Builder.Default
    private List<WorkoutDayDto> days = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
