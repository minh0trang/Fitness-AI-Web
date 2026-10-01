package com.fitness.activityservice.controller;

import com.fitness.activityservice.dto.CreateWeeklyPlanRequest;
import com.fitness.activityservice.dto.WeeklyPlanDto;
import com.fitness.activityservice.service.WeeklyPlanService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/activities/plans")
@RequiredArgsConstructor
@Slf4j
public class WeeklyPlanController {

    private final WeeklyPlanService weeklyPlanService;

    /**
     * 1. Create a Weekly Plan Preview.
     * Note: Newly created plans are strictly in PREVIEW mode (isActive = false).
     */
    @PostMapping
    public ResponseEntity<WeeklyPlanDto> createPreviewPlan(
            @RequestHeader(value = "X-User-ID", required = false) String userId,
            @RequestBody CreateWeeklyPlanRequest request) {
        String effectiveUserId = userId != null ? userId : "guest-user";
        log.info("REST request to create preview plan for user: {}", effectiveUserId);
        WeeklyPlanDto created = weeklyPlanService.createPreviewPlan(effectiveUserId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * 2. User Accept/Apply Plan: Transition from PREVIEW to ACTIVE.
     */
    @PostMapping("/{planId}/apply")
    public ResponseEntity<WeeklyPlanDto> applyPlan(
            @RequestHeader(value = "X-User-ID", required = false) String userId,
            @PathVariable String planId) {
        String effectiveUserId = userId != null ? userId : "guest-user";
        log.info("REST request to apply plan: {} for user: {}", planId, effectiveUserId);
        WeeklyPlanDto applied = weeklyPlanService.applyPlan(effectiveUserId, planId);
        return ResponseEntity.ok(applied);
    }

    /**
     * 3. Apply Old Plan as New (COPY on Reuse).
     */
    @PostMapping("/{planId}/apply-as-new")
    public ResponseEntity<WeeklyPlanDto> applyAsNew(
            @RequestHeader(value = "X-User-ID", required = false) String userId,
            @PathVariable String planId) {
        String effectiveUserId = userId != null ? userId : "guest-user";
        log.info("REST request to copy old plan: {} to new active week plan for user: {}", planId, effectiveUserId);
        WeeklyPlanDto newPlan = weeklyPlanService.applyAsNew(effectiveUserId, planId);
        return ResponseEntity.status(HttpStatus.CREATED).body(newPlan);
    }

    /**
     * 4. Get Current Active Plan for user.
     */
    @GetMapping("/active")
    public ResponseEntity<WeeklyPlanDto> getActivePlan(
            @RequestHeader(value = "X-User-ID", required = false) String userId) {
        String effectiveUserId = userId != null ? userId : "guest-user";
        WeeklyPlanDto activePlan = weeklyPlanService.getActivePlan(effectiveUserId);
        if (activePlan == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(activePlan);
    }

    /**
     * 5. Get Plan by ID.
     */
    @GetMapping("/{planId}")
    public ResponseEntity<WeeklyPlanDto> getPlanById(@PathVariable String planId) {
        WeeklyPlanDto plan = weeklyPlanService.getPlanById(planId);
        return ResponseEntity.ok(plan);
    }
}
