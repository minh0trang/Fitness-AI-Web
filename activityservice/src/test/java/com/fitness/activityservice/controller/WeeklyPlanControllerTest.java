package com.fitness.activityservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fitness.activityservice.dto.CreateWeeklyPlanRequest;
import com.fitness.activityservice.dto.WeeklyPlanDto;
import com.fitness.activityservice.dto.WorkoutDayDto;
import com.fitness.activityservice.service.WeeklyPlanService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(WeeklyPlanController.class)
class WeeklyPlanControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private WeeklyPlanService weeklyPlanService;

    @Test
    @DisplayName("POST /api/activities/plans - Tạo plan preview trả về 201 Created và isActive=false")
    void testCreatePreviewPlan_Endpoint() throws Exception {
        CreateWeeklyPlanRequest request = CreateWeeklyPlanRequest.builder()
                .goal("Giảm vòng eo")
                .level("Beginner")
                .durationPerSession("30-45")
                .frequencyPerWeek(5)
                .days(Collections.singletonList(
                        WorkoutDayDto.builder()
                                .dayIndex(1)
                                .dayName("T2")
                                .focus("Core")
                                .intensity("Moderate")
                                .totalMinutes(42)
                                .isRestDay(false)
                                .build()
                ))
                .build();

        WeeklyPlanDto mockDto = WeeklyPlanDto.builder()
                .id("plan-preview-1")
                .userId("kc-user-777")
                .goal("Giảm vòng eo")
                .level("Beginner")
                .durationPerSession("30-45")
                .frequencyPerWeek(5)
                .isActive(false) // Preview
                .build();

        when(weeklyPlanService.createPreviewPlan(eq("kc-user-777"), any(CreateWeeklyPlanRequest.class)))
                .thenReturn(mockDto);

        mockMvc.perform(post("/api/activities/plans")
                        .header("X-User-ID", "kc-user-777")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("plan-preview-1"))
                .andExpect(jsonPath("$.isActive").value(false))
                .andExpect(jsonPath("$.goal").value("Giảm vòng eo"));
    }

    @Test
    @DisplayName("POST /api/activities/plans/{planId}/apply - Kích hoạt plan trả về 200 OK và isActive=true")
    void testApplyPlan_Endpoint() throws Exception {
        WeeklyPlanDto activeDto = WeeklyPlanDto.builder()
                .id("plan-preview-1")
                .userId("kc-user-777")
                .isActive(true)
                .build();

        when(weeklyPlanService.applyPlan("kc-user-777", "plan-preview-1")).thenReturn(activeDto);

        mockMvc.perform(post("/api/activities/plans/plan-preview-1/apply")
                        .header("X-User-ID", "kc-user-777"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("plan-preview-1"))
                .andExpect(jsonPath("$.isActive").value(true));
    }

    @Test
    @DisplayName("POST /api/activities/plans/{planId}/apply-as-new - Tái sử dụng plan cũ trả về 201 Created")
    void testApplyAsNew_Endpoint() throws Exception {
        WeeklyPlanDto newCopyDto = WeeklyPlanDto.builder()
                .id("plan-new-copied")
                .userId("kc-user-777")
                .startDate(LocalDate.now())
                .isActive(true)
                .build();

        when(weeklyPlanService.applyAsNew("kc-user-777", "old-plan-1")).thenReturn(newCopyDto);

        mockMvc.perform(post("/api/activities/plans/old-plan-1/apply-as-new")
                        .header("X-User-ID", "kc-user-777"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("plan-new-copied"))
                .andExpect(jsonPath("$.isActive").value(true));
    }

    @Test
    @DisplayName("GET /api/activities/plans/active - Lấy active plan thành công trả về 200 OK")
    void testGetActivePlan_Found() throws Exception {
        WeeklyPlanDto activeDto = WeeklyPlanDto.builder()
                .id("active-plan-1")
                .userId("kc-user-777")
                .isActive(true)
                .goal("Giảm vòng eo")
                .build();

        when(weeklyPlanService.getActivePlan("kc-user-777")).thenReturn(activeDto);

        mockMvc.perform(get("/api/activities/plans/active")
                        .header("X-User-ID", "kc-user-777"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("active-plan-1"))
                .andExpect(jsonPath("$.isActive").value(true));
    }

    @Test
    @DisplayName("GET /api/activities/plans/active - Khi chưa có active plan trả về 404 Not Found")
    void testGetActivePlan_NotFound() throws Exception {
        when(weeklyPlanService.getActivePlan("kc-user-777")).thenReturn(null);

        mockMvc.perform(get("/api/activities/plans/active")
                        .header("X-User-ID", "kc-user-777"))
                .andExpect(status().isNotFound());
    }
}
