package com.fitness.userservice.repository;

import com.fitness.userservice.model.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, String> {

    Optional<UserProfile> findByUserId(String userId);

    Optional<UserProfile> findByUserKeycloackId(String keycloackId);

    Optional<UserProfile> findByUserEmail(String email);
}
