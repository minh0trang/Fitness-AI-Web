package com.fitness.activityservice.controller;

import com.fitness.activityservice.dto.WorkoutJournalRequest;
import com.fitness.activityservice.dto.WorkoutJournalResponse;
import com.fitness.activityservice.service.WorkoutJournalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/activities/journals", "/api/workout-journals"})
@RequiredArgsConstructor
@Slf4j
public class WorkoutJournalController {

    private final WorkoutJournalService workoutJournalService;

    /**
     * 1. Submit or update post-workout journal entry.
     * All operations strictly resolve userId from X-User-ID header.
     */
    @PostMapping
    public ResponseEntity<WorkoutJournalResponse> recordJournal(
            @RequestHeader("X-User-ID") String userId,
            @RequestBody WorkoutJournalRequest request) {
        log.info("REST request to record journal for user: {}, planId: {}, day: {}",
                userId, request.getPlanId(), request.getDayIndex());
        WorkoutJournalResponse response = workoutJournalService.recordJournal(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 2. Get specific journal by ID.
     */
    @GetMapping("/{journalId}")
    public ResponseEntity<WorkoutJournalResponse> getJournalById(
            @RequestHeader("X-User-ID") String userId,
            @PathVariable String journalId) {
        WorkoutJournalResponse response = workoutJournalService.getJournalById(userId, journalId);
        return ResponseEntity.ok(response);
    }

    /**
     * 3. Get all journals for a specific plan for the authenticated user.
     */
    @GetMapping("/plan/{planId}")
    public ResponseEntity<List<WorkoutJournalResponse>> getJournalsByPlan(
            @RequestHeader("X-User-ID") String userId,
            @PathVariable String planId) {
        List<WorkoutJournalResponse> responses = workoutJournalService.getJournalsByPlan(userId, planId);
        return ResponseEntity.ok(responses);
    }

    /**
     * 4. Get all workout journals for the authenticated user (no /user/{userId} path).
     */
    @GetMapping
    public ResponseEntity<List<WorkoutJournalResponse>> getUserJournals(
            @RequestHeader("X-User-ID") String userId) {
        List<WorkoutJournalResponse> responses = workoutJournalService.getUserJournals(userId);
        return ResponseEntity.ok(responses);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgument(IllegalArgumentException ex) {
        log.warn("Validation error in WorkoutJournalController: {}", ex.getMessage());
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
}
