package com.fitness.activityservice.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiRawDayDto {

    private Integer dayIndex; // 1 to 7
    private String dayName;   // T2, T3, T4...
    private String focus;
    private String intensity;
    private Integer totalMinutes;
    private Boolean isRestDay;

    @Builder.Default
    private List<AiRawExerciseDto> exercises = new ArrayList<>();
}
