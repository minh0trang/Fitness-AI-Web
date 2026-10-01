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
public class WorkoutJournalRequest {
    private String planId;
    private Integer dayIndex;

    private String workoutTitle;
    private LocalDate workoutDate; // Defaults to today if null

    private Integer actualDurationMinutes;
    private Integer plannedDurationMinutes;
    private String plannedIntensity;
    private Integer caloriesBurned;

    private Integer difficulty;
    private Integer energy;

    private Boolean hasPain;

    @Builder.Default
    private List<String> painLocations = new ArrayList<>();

    private String notes;
    private String photoUrl; // Cloud URL reference only
}
