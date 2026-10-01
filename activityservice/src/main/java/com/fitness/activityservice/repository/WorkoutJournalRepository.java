package com.fitness.activityservice.repository;

import com.fitness.activityservice.model.WorkoutJournal;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkoutJournalRepository extends MongoRepository<WorkoutJournal, String> {

    Optional<WorkoutJournal> findByUserIdAndPlanIdAndDayIndex(String userId, String planId, Integer dayIndex);

    List<WorkoutJournal> findByUserIdAndPlanId(String userId, String planId);

    List<WorkoutJournal> findByUserIdOrderByWorkoutDateDesc(String userId);

    List<WorkoutJournal> findByUserIdAndWorkoutDateBetween(String userId, LocalDate from, LocalDate to);
}
