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

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "exercises")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Exercise {

    @Id
    private String id;

    @Indexed(unique = true)
    private String code; // Uppercase snake_case: PUSH_UP, SQUAT, PLANK...

    private String name; // Tên tiếng Việt hiển thị
    private String focus; // Chest, Back, Legs, Core, Shoulders, Full Body, Warmup, Cooldown
    private String difficulty; // BEGINNER, INTERMEDIATE, ADVANCED

    @Builder.Default
    private List<String> equipment = new ArrayList<>(); // BODYWEIGHT, DUMBBELL, YOGA_MAT...

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
