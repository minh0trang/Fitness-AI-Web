package com.fitness.activityservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutExerciseDto {
    private String phase; // WARMUP, MAIN, COOLDOWN
    private String name;
    private Integer durationMinutes;
    private String youtubeVideoId;
    private Integer order;
}
