package com.fitness.activityservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "workout_journals")
@CompoundIndex(name = "user_plan_day_idx", def = "{'userId': 1, 'planId': 1, 'dayIndex': 1}", unique = true)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutJournal {

    @Id
    private String id;

    private String userId; // Keycloak ID
    private String planId; // Associated WeeklyPlan ID
    private Integer dayIndex; // 1 to 7

    private String workoutTitle;
    private LocalDate workoutDate;
    private LocalDateTime completedAt;

    private Integer actualDurationMinutes;
    private Integer plannedDurationMinutes;
    private String plannedIntensity;
    private Integer caloriesBurned; // Estimated value

    private Integer difficulty; // 1 to 5 (RPE)
    private Integer energy; // 1 to 5 (Vitality level for calendar heatmap)

    private Boolean hasPain;

    @Builder.Default
    private List<String> painLocations = new ArrayList<>();

    private String notes;
    private String photoUrl; // URL reference only, no binary in MongoDB

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
