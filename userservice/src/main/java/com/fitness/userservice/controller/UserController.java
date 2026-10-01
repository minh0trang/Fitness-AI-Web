package com.fitness.userservice.controller;

import com.fitness.userservice.dto.*;
import com.fitness.userservice.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;

    /**
     * Auto-sync Keycloak authenticated user into PostgreSQL.
     * Returns whether the user's physical profile is already completed.
     */
    @PostMapping("/sync")
    public ResponseEntity<UserSyncResponse> syncUser(@Valid @RequestBody UserSyncRequest request) {
        log.info("Received user sync request for email: {}", request.getEmail());
        return ResponseEntity.ok(userService.syncUser(request));
    }

    /**
     * Fetch user's physical profile, biometrics, and workout constraints.
     */
    @GetMapping("/{keycloakId}/profile")
    public ResponseEntity<UserProfileDto> getProfile(@PathVariable String keycloakId) {
        return ResponseEntity.ok(userService.getUserProfile(keycloakId));
    }

    /**
     * Update user's physical profile and mark onboarding completed.
     */
    @PutMapping("/{keycloakId}/profile")
    public ResponseEntity<UserProfileDto> updateProfile(
            @PathVariable String keycloakId,
            @RequestBody UserProfileDto profileDto) {
        log.info("Updating physical profile for keycloakId: {}", keycloakId);
        return ResponseEntity.ok(userService.updateUserProfile(keycloakId, profileDto));
    }

    /**
     * Legacy user profile endpoint by internal DB UUID.
     */
    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getUserProfileLegacy(@PathVariable String userId) {
        return ResponseEntity.ok(userService.getUserLegacyProfile(userId));
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(userService.register(request));
    }

    @GetMapping("/{userId}/validate")
    public ResponseEntity<Boolean> validateUser(@PathVariable String userId) {
        return ResponseEntity.ok(userService.existByUserId(userId));
    }
}
