package com.fitness.activityservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutExercise {
    private ExercisePhase phase;
    private String name;
    private Integer durationMinutes;
    private String youtubeVideoId;
    private Integer order;
}
