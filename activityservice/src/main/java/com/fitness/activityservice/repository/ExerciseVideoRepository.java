package com.fitness.activityservice.repository;

import com.fitness.activityservice.model.ExerciseVideo;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExerciseVideoRepository extends MongoRepository<ExerciseVideo, String> {

    List<ExerciseVideo> findByExerciseId(String exerciseId);

    List<ExerciseVideo> findByExerciseCode(String exerciseCode);

    Optional<ExerciseVideo> findFirstByExerciseCodeAndLevel(String exerciseCode, String level);
}
