package com.fitness.activityservice.repository;

import com.fitness.activityservice.model.WeeklyPlan;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WeeklyPlanRepository extends MongoRepository<WeeklyPlan, String> {

    Optional<WeeklyPlan> findByUserIdAndIsActiveTrue(String userId);

    List<WeeklyPlan> findByUserIdOrderByCreatedAtDesc(String userId);

    List<WeeklyPlan> findByUserIdAndIsActive(String userId, Boolean isActive);
}
