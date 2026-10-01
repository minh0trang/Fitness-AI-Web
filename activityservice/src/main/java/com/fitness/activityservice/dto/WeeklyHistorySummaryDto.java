package com.fitness.activityservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyHistorySummaryDto {

    private String planId;
    private LocalDate weekStartDate;
    private LocalDate weekEndDate;

    private Integer totalScheduledDays;
    private Integer completedDays;
    private Double completionRate;

    private Integer actualMinutes;
    private Integer targetMinutes;

    private Double averageDifficulty;
    private Double averageEnergy;

    @Builder.Default
    private List<String> painReports = new ArrayList<>();

    @Builder.Default
    private Map<String, Integer> focusDistribution = new LinkedHashMap<>();
}
