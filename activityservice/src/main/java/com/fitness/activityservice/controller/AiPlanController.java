package com.fitness.activityservice.controller;

import com.fitness.activityservice.dto.WeeklyPlanDto;
import com.fitness.activityservice.dto.ai.AiGeneratePlanRequest;
import com.fitness.activityservice.service.AiPlanGenerationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Slf4j
public class AiPlanController {

    private final AiPlanGenerationService aiPlanGenerationService;

    /**
     * Endpoint sinh kế hoạch tuần bằng AI (F05)
     * Hỗ trợ cả 2 đường dẫn gateway /api/activities/plans/generate và /api/ai/plans/generate
     */
    @PostMapping({"/api/activities/plans/generate", "/api/ai/plans/generate"})
    public ResponseEntity<WeeklyPlanDto> generateWeeklyPlan(
            @RequestHeader(value = "X-User-ID", required = false) String userId,
            @RequestBody AiGeneratePlanRequest request) {

        if (request != null && request.getUserProfile() != null && userId != null) {
            if (request.getUserProfile().getUserId() == null) {
                request.getUserProfile().setUserId(userId);
            }
        }

        log.info("REST request to generate AI weekly plan for user: {}", userId);
        WeeklyPlanDto previewPlan = aiPlanGenerationService.generateWeeklyPlan(request);
        return ResponseEntity.ok(previewPlan);
    }
}
