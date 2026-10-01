package com.fitness.activityservice.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiRawExerciseDto {

    private String phase; // WARMUP, MAIN, COOLDOWN
    private String exerciseCode; // e.g. PUSH_UP, SQUAT, PLANK_BASIC
    private Integer durationMinutes;
    private Integer sets;
    private Integer reps;
    private Integer order;
}
