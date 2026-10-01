package com.fitness.activityservice.controller;

import com.fitness.activityservice.dto.WeeklyHistorySummaryDto;
import com.fitness.activityservice.service.WeeklyHistorySummaryService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(WeeklyHistorySummaryController.class)
@AutoConfigureMockMvc(addFilters = false)
class WeeklyHistorySummaryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private WeeklyHistorySummaryService weeklyHistorySummaryService;

    @Test
    @DisplayName("GET /api/activities/summary/weekly - Trả về 200 OK và JSON khi có lịch sử tuần trước")
    void testGetPreviousWeekSummary_Success() throws Exception {
        WeeklyHistorySummaryDto mockSummary = WeeklyHistorySummaryDto.builder()
                .planId("plan-week-1")
                .weekStartDate(LocalDate.of(2026, 9, 21))
                .weekEndDate(LocalDate.of(2026, 9, 27))
                .totalScheduledDays(5)
                .completedDays(4)
                .completionRate(80.0)
                .actualMinutes(168)
                .targetMinutes(200)
                .averageDifficulty(3.3)
                .averageEnergy(4.0)
                .painReports(Collections.singletonList("KNEE_PAIN"))
                .build();

        when(weeklyHistorySummaryService.getPreviousWeekSummary("user-kc-1"))
                .thenReturn(Optional.of(mockSummary));

        mockMvc.perform(get("/api/activities/summary/weekly")
                        .header("X-User-ID", "user-kc-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.planId").value("plan-week-1"))
                .andExpect(jsonPath("$.totalScheduledDays").value(5))
                .andExpect(jsonPath("$.completedDays").value(4))
                .andExpect(jsonPath("$.completionRate").value(80.0))
                .andExpect(jsonPath("$.actualMinutes").value(168))
                .andExpect(jsonPath("$.painReports[0]").value("KNEE_PAIN"));
    }

    @Test
    @DisplayName("GET /api/activities/summary/weekly - Trả về 204 No Content khi tuần đầu tiên / không có lịch sử")
    void testGetPreviousWeekSummary_NoContent() throws Exception {
        when(weeklyHistorySummaryService.getPreviousWeekSummary("user-new-1"))
                .thenReturn(Optional.empty());

        mockMvc.perform(get("/api/activities/summary/weekly")
                        .header("X-User-ID", "user-new-1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("GET /api/activities/summary/weekly/{planId} - Trả về 200 OK khi lấy theo planId")
    void testGetSummaryByPlanId_Success() throws Exception {
        WeeklyHistorySummaryDto mockSummary = WeeklyHistorySummaryDto.builder()
                .planId("plan-week-1")
                .totalScheduledDays(5)
                .completedDays(5)
                .completionRate(100.0)
                .build();

        when(weeklyHistorySummaryService.getSummaryByPlanId("user-kc-1", "plan-week-1"))
                .thenReturn(mockSummary);

        mockMvc.perform(get("/api/activities/summary/weekly/plan-week-1")
                        .header("X-User-ID", "user-kc-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.planId").value("plan-week-1"))
                .andExpect(jsonPath("$.completionRate").value(100.0));
    }

    @Test
    @DisplayName("GET /api/activities/summary/weekly/{planId} - Trả về 400 Bad Request khi không có quyền truy cập plan")
    void testGetSummaryByPlanId_Unauthorized() throws Exception {
        when(weeklyHistorySummaryService.getSummaryByPlanId("other-user-999", "plan-week-1"))
                .thenThrow(new IllegalArgumentException("Unauthorized access to plan: plan-week-1"));

        mockMvc.perform(get("/api/activities/summary/weekly/plan-week-1")
                        .header("X-User-ID", "other-user-999"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Unauthorized access to plan: plan-week-1"));
    }
}
