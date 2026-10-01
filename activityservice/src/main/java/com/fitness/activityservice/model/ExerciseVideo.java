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

@Document(collection = "exercise_videos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExerciseVideo {

    @Id
    private String id;

    @Indexed
    private String exerciseId;

    @Indexed
    private String exerciseCode;

    private String title;
    private String youtubeUrl;
    private String youtubeVideoId;
    private String thumbnailUrl;
    private Integer duration; // Duration in seconds

    private String level; // BEGINNER, INTERMEDIATE, ADVANCED

    @Builder.Default
    private List<String> equipment = new ArrayList<>();

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
