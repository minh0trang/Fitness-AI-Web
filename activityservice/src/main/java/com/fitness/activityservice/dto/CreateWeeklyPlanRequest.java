package com.fitness.activityservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateWeeklyPlanRequest {
    private String goal;
    private String level;
    private String durationPerSession;
    private Integer frequencyPerWeek;
    private String weeklyOverview;
    private String coachTip;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate trainingStartDate;

    @Builder.Default
    private List<WorkoutDayDto> days = new ArrayList<>();
}
