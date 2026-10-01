package com.fitness.userservice.service;

import com.fitness.userservice.dto.RegisterRequest;
import com.fitness.userservice.dto.UserProfileDto;
import com.fitness.userservice.dto.UserResponse;
import com.fitness.userservice.dto.UserSyncRequest;
import com.fitness.userservice.dto.UserSyncResponse;
import com.fitness.userservice.model.User;
import com.fitness.userservice.model.UserProfile;
import com.fitness.userservice.model.enums.*;
import com.fitness.userservice.repository.UserProfileRepository;
import com.fitness.userservice.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;

    @Transactional
    public UserSyncResponse syncUser(UserSyncRequest request) {
        log.info("Syncing Keycloak user: keycloakId={}, email={}", request.getKeycloakId(), request.getEmail());

        User user = null;
        Optional<UserProfile> existingProfileByKeycloak = userProfileRepository.findByUserKeycloackId(request.getKeycloakId());

        if (existingProfileByKeycloak.isPresent()) {
            user = existingProfileByKeycloak.get().getUser();
        } else if (userRepository.existsByKeycloackId(request.getKeycloakId())) {
            // Find user directly
            user = userRepository.findAll().stream()
                    .filter(u -> request.getKeycloakId().equals(u.getKeycloackId()))
                    .findFirst()
                    .orElse(null);
        } else if (userRepository.existsByEmail(request.getEmail())) {
            user = userRepository.findByEmail(request.getEmail());
            user.setKeycloackId(request.getKeycloakId());
            if (request.getFirstName() != null) user.setFirstname(request.getFirstName());
            if (request.getLastName() != null) user.setLastname(request.getLastName());
            user = userRepository.save(user);
        }

        if (user == null) {
            user = new User();
            user.setEmail(request.getEmail());
            user.setKeycloackId(request.getKeycloakId());
            user.setFirstname(request.getFirstName() != null ? request.getFirstName() : "");
            user.setLastname(request.getLastName() != null ? request.getLastName() : "");
            user.setPassword("KEYCLOAK_MANAGED");
            user = userRepository.save(user);
            log.info("Created new user from Keycloak sync with id={}", user.getId());
        }

        // Ensure user has a profile record
        final User finalUser = user;
        UserProfile profile = userProfileRepository.findByUserId(finalUser.getId())
                .orElseGet(() -> {
                    UserProfile newProfile = UserProfile.builder()
                            .user(finalUser)
                            .isProfileCompleted(false)
                            .build();
                    return userProfileRepository.save(newProfile);
                });

        return UserSyncResponse.builder()
                .id(user.getId())
                .keycloakId(user.getKeycloackId())
                .email(user.getEmail())
                .firstName(user.getFirstname())
                .lastName(user.getLastname())
                .isProfileCompleted(Boolean.TRUE.equals(profile.getIsProfileCompleted()))
                .build();
    }

    @Transactional(readOnly = true)
    public UserProfileDto getUserProfile(String keycloakId) {
        UserProfile profile = userProfileRepository.findByUserKeycloackId(keycloakId)
                .orElseGet(() -> {
                    // Fallback search by internal user ID if keycloakId matches user id
                    return userProfileRepository.findByUserId(keycloakId)
                            .orElseThrow(() -> new RuntimeException("Profile not found for user: " + keycloakId));
                });

        return mapToDto(profile);
    }

    @Transactional
    public UserProfileDto updateUserProfile(String keycloakId, UserProfileDto dto) {
        UserProfile profile = userProfileRepository.findByUserKeycloackId(keycloakId)
                .orElseGet(() -> {
                    return userProfileRepository.findByUserId(keycloakId)
                            .orElseThrow(() -> new RuntimeException("User profile not found for identifier: " + keycloakId));
                });

        // Parse Enums safely
        if (dto.getGender() != null) {
            profile.setGender(parseEnum(Gender.class, dto.getGender()));
        }
        if (dto.getActivityLevel() != null) {
            profile.setActivityLevel(parseEnum(ActivityLevel.class, dto.getActivityLevel()));
        }
        if (dto.getFitnessGoal() != null) {
            profile.setFitnessGoal(parseEnum(FitnessGoal.class, dto.getFitnessGoal()));
        }
        if (dto.getExperience() != null) {
            profile.setExperience(parseEnum(ExperienceLevel.class, dto.getExperience()));
        }

        // Workout preferences
        if (dto.getWorkoutPreferences() != null) {
            Set<WorkoutPreference> parsedPrefs = dto.getWorkoutPreferences().stream()
                    .map(s -> parseEnum(WorkoutPreference.class, s))
                    .filter(java.util.Objects::nonNull)
                    .collect(Collectors.toSet());
            profile.setWorkoutPreferences(parsedPrefs);
        }

        // Numeric metrics
        if (dto.getAge() != null) profile.setAge(dto.getAge());
        if (dto.getHeight() != null) profile.setHeight(dto.getHeight());
        if (dto.getWeight() != null) profile.setWeight(dto.getWeight());
        if (dto.getChest() != null) profile.setChest(dto.getChest());
        if (dto.getWaist() != null) profile.setWaist(dto.getWaist());
        if (dto.getHips() != null) profile.setHips(dto.getHips());

        // Constraints & wishes
        if (dto.getCustomWishes() != null) profile.setCustomWishes(dto.getCustomWishes());
        if (dto.getWorkoutDuration() != null) profile.setWorkoutDuration(dto.getWorkoutDuration());
        if (dto.getSelectedDays() != null) profile.setSelectedDays(dto.getSelectedDays());

        // Limitations
        if (dto.getLimitations() != null) {
            Set<PhysicalLimitation> parsedLimitations = dto.getLimitations().stream()
                    .map(s -> parseEnum(PhysicalLimitation.class, s))
                    .filter(java.util.Objects::nonNull)
                    .collect(Collectors.toSet());
            profile.setLimitations(parsedLimitations);
        }

        // Equipment
        if (dto.getEquipment() != null) {
            Set<EquipmentType> parsedEquipment = dto.getEquipment().stream()
                    .map(s -> parseEnum(EquipmentType.class, s))
                    .filter(java.util.Objects::nonNull)
                    .collect(Collectors.toSet());
            profile.setEquipment(parsedEquipment);
        }

        // Mark profile completed if essential measurements are present
        boolean completed = profile.getHeight() != null && profile.getWeight() != null && profile.getHeight() > 0 && profile.getWeight() > 0;
        profile.setIsProfileCompleted(completed);

        UserProfile saved = userProfileRepository.save(profile);
        log.info("Updated profile for keycloakId={}: isProfileCompleted={}", keycloakId, completed);
        return mapToDto(saved);
    }

    private UserProfileDto mapToDto(UserProfile profile) {
        User user = profile.getUser();
        String name = "";
        if (user != null) {
            name = (user.getFirstname() != null ? user.getFirstname() : "") + " " +
                   (user.getLastname() != null ? user.getLastname() : "");
            name = name.trim();
        }

        return UserProfileDto.builder()
                .userId(user != null ? user.getId() : null)
                .keycloakId(user != null ? user.getKeycloackId() : null)
                .email(user != null ? user.getEmail() : null)
                .name(name)
                .gender(profile.getGender() != null ? profile.getGender().name() : null)
                .age(profile.getAge())
                .height(profile.getHeight())
                .weight(profile.getWeight())
                .chest(profile.getChest())
                .waist(profile.getWaist())
                .hips(profile.getHips())
                .activityLevel(profile.getActivityLevel() != null ? profile.getActivityLevel().name() : null)
                .fitnessGoal(profile.getFitnessGoal() != null ? profile.getFitnessGoal().name() : null)
                .experience(profile.getExperience() != null ? profile.getExperience().name() : null)
                .workoutPreferences(profile.getWorkoutPreferences() != null
                        ? profile.getWorkoutPreferences().stream().map(Enum::name).collect(Collectors.toSet())
                        : new HashSet<>())
                .customWishes(profile.getCustomWishes())
                .workoutDuration(profile.getWorkoutDuration())
                .selectedDays(profile.getSelectedDays())
                .limitations(profile.getLimitations() != null
                        ? profile.getLimitations().stream().map(Enum::name).collect(Collectors.toSet())
                        : new HashSet<>())
                .equipment(profile.getEquipment() != null
                        ? profile.getEquipment().stream().map(Enum::name).collect(Collectors.toSet())
                        : new HashSet<>())
                .isProfileCompleted(Boolean.TRUE.equals(profile.getIsProfileCompleted()))
                .updatedAt(profile.getUpdatedAt())
                .build();
    }

    private <E extends Enum<E>> E parseEnum(Class<E> enumClass, String value) {
        if (value == null || value.trim().isEmpty()) return null;
        try {
            return Enum.valueOf(enumClass, value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            // Also try with underscores / replacements for values like "knee_pain" -> "KNEE_PAIN"
            String normalized = value.trim().replace('-', '_').toUpperCase();
            try {
                return Enum.valueOf(enumClass, normalized);
            } catch (Exception ignored) {
                log.warn("Unable to parse enum {} for value: {}", enumClass.getSimpleName(), value);
                return null;
            }
        }
    }

    // Existing methods maintained
    public UserResponse register(@Valid RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            User existingUser = userRepository.findByEmail(request.getEmail());
            UserResponse userResponse = new UserResponse();
            userResponse.setId(existingUser.getId());
            userResponse.setKeycloackId(existingUser.getKeycloackId());
            userResponse.setEmail(existingUser.getEmail());
            userResponse.setFirstname(existingUser.getFirstname());
            userResponse.setLastname(existingUser.getLastname());
            userResponse.setPassword(existingUser.getPassword());
            userResponse.setCreatedAt(existingUser.getCreatedAt());
            userResponse.setUpdatedAt(existingUser.getUpdatedAt());
            return userResponse;
        }
        User user = new User();
        user.setFirstname(request.getFirstName());
        user.setLastname(request.getLastName());
        user.setKeycloackId(request.getKeycloakId());
        user.setPassword(request.getPassword());
        user.setEmail(request.getEmail());

        User saveUser = userRepository.save(user);

        // Auto create profile
        UserProfile profile = UserProfile.builder()
                .user(saveUser)
                .isProfileCompleted(false)
                .build();
        userProfileRepository.save(profile);

        UserResponse userResponse = new UserResponse();
        userResponse.setId(saveUser.getId());
        userResponse.setKeycloackId(saveUser.getKeycloackId());
        userResponse.setEmail(saveUser.getEmail());
        userResponse.setFirstname(saveUser.getFirstname());
        userResponse.setLastname(saveUser.getLastname());
        userResponse.setPassword(saveUser.getPassword());
        userResponse.setCreatedAt(saveUser.getCreatedAt());
        userResponse.setUpdatedAt(saveUser.getUpdatedAt());
        return userResponse;
    }

    public UserResponse getUserLegacyProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        UserResponse userResponse = new UserResponse();
        userResponse.setId(user.getId());
        userResponse.setEmail(user.getEmail());
        userResponse.setFirstname(user.getFirstname());
        userResponse.setLastname(user.getLastname());
        userResponse.setPassword(user.getPassword());
        userResponse.setCreatedAt(user.getCreatedAt());
        userResponse.setUpdatedAt(user.getUpdatedAt());
        return userResponse;
    }

    public Boolean existByUserId(String userId) {
        log.info("Calling User Validation API for a userID: " + userId);
        return userRepository.existsByKeycloackId(userId);
    }
}
