package com.fitness.activityservice.controller;

import com.fitness.activityservice.dto.WeeklyHistorySummaryDto;
import com.fitness.activityservice.service.WeeklyHistorySummaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/activities/summary/weekly")
@RequiredArgsConstructor
@Slf4j
public class WeeklyHistorySummaryController {

    private final WeeklyHistorySummaryService weeklyHistorySummaryService;

    /**
     * 1. Lấy tóm tắt tuần vừa kết thúc của user (dùng cho AI sinh plan tuần mới).
     * Trả về 200 OK kèm payload, hoặc 204 No Content nếu là tuần đầu tiên / chưa có lịch sử tuần trước.
     */
    @GetMapping
    public ResponseEntity<WeeklyHistorySummaryDto> getPreviousWeekSummary(
            @RequestHeader("X-User-ID") String userId) {
        log.info("REST request to get previous week summary for userId: {}", userId);
        Optional<WeeklyHistorySummaryDto> summaryOpt = weeklyHistorySummaryService.getPreviousWeekSummary(userId);
        return summaryOpt.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    /**
     * 2. Lấy tóm tắt chi tiết của một WeeklyPlan xác định theo planId.
     */
    @GetMapping("/{planId}")
    public ResponseEntity<WeeklyHistorySummaryDto> getSummaryByPlanId(
            @RequestHeader("X-User-ID") String userId,
            @PathVariable String planId) {
        log.info("REST request to get summary for planId: {} by userId: {}", planId, userId);
        WeeklyHistorySummaryDto summary = weeklyHistorySummaryService.getSummaryByPlanId(userId, planId);
        return ResponseEntity.ok(summary);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgument(IllegalArgumentException ex) {
        log.warn("Validation/Security error in WeeklyHistorySummaryController: {}", ex.getMessage());
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
}
