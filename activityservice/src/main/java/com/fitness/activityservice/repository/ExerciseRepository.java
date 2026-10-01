package com.fitness.activityservice.repository;

import com.fitness.activityservice.model.Exercise;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExerciseRepository extends MongoRepository<Exercise, String> {

    Optional<Exercise> findByCode(String code);

    List<Exercise> findByCodeIn(Collection<String> codes);

    List<Exercise> findByFocus(String focus);

    boolean existsByCode(String code);
}
