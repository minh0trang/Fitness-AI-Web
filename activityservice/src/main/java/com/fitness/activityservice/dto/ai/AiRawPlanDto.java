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
public class AiRawPlanDto {

    private String goal;
    private String level;
    private String durationPerSession;
    private Integer frequencyPerWeek;
    private String weeklyOverview;
    private String coachTip;

    @Builder.Default
    private List<AiRawDayDto> days = new ArrayList<>();
}
