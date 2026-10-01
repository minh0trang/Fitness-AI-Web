package com.fitness.activityservice.model;

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
public class WorkoutDay {
    private Integer dayIndex;
    private String dayName;
    private LocalDate date;
    private String focus;
    private String intensity;
    private Integer totalMinutes;
    private Boolean isRestDay;

    @Builder.Default
    private List<WorkoutExercise> exercises = new ArrayList<>();
}
