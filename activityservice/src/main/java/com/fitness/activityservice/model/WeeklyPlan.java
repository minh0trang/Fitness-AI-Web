package com.fitness.activityservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "weekly_plans")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyPlan {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String goal;
    private String level;
    private String durationPerSession;
    private Integer frequencyPerWeek;
    private String weeklyOverview;
    private String coachTip;

    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate trainingStartDate;

    @Indexed
    @Builder.Default
    private Boolean isActive = false;

    private LocalDateTime activatedAt;

    @Builder.Default
    private List<WorkoutDay> days = new ArrayList<>();

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
