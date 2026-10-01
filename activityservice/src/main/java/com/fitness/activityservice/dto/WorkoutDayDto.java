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
public class WorkoutDayDto {
    private Integer dayIndex;
    private String dayName;
    private LocalDate date;
    private String focus;
    private String intensity;
    private Integer totalMinutes;
    private Boolean isRestDay;
    private String status; // Dynamically computed: COMPLETED, TODAY, UPCOMING, REST, NOT_STARTED

    @Builder.Default
    private List<WorkoutExerciseDto> exercises = new ArrayList<>();
}
