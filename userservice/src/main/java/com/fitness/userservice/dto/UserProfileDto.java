package com.fitness.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDto {

    private String userId;
    private String keycloakId;
    private String email;
    private String name;

    private String gender; // MALE, FEMALE, OTHER (case-insensitive)
    private Integer age;
    private Double height;
    private Double weight;
    private Double chest;
    private Double waist;
    private Double hips;

    private String activityLevel; // SEDENTARY, LIGHT, MODERATE, ACTIVE, VERY_ACTIVE
    private String fitnessGoal;   // WEIGHT_LOSS, FAT_LOSS, MUSCLE_GAIN, STRENGTH, ENDURANCE, FLEXIBILITY, GENERAL_FITNESS
    private String experience;    // BEGINNER, INTERMEDIATE, ADVANCED

    @Builder.Default
    private Set<String> workoutPreferences = new HashSet<>(); // STRENGTH, CARDIO, YOGA, PILATES, MOBILITY, HIIT

    private String customWishes;
    private String workoutDuration; // e.g. "30-45"

    @Builder.Default
    private List<Integer> selectedDays = new ArrayList<>();

    @Builder.Default
    private Set<String> limitations = new HashSet<>();

    @Builder.Default
    private Set<String> equipment = new HashSet<>();

    private Boolean isProfileCompleted;
    private LocalDateTime updatedAt;
}
