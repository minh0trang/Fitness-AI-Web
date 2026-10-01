package com.fitness.activityservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fitness.activityservice.dto.UserProfileDto;
import com.fitness.activityservice.dto.WeeklyPlanDto;
import com.fitness.activityservice.dto.WorkoutDayDto;
import com.fitness.activityservice.dto.ai.AiGeneratePlanRequest;
import com.fitness.activityservice.service.AiPlanGenerationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AiPlanController.class)
class AiPlanControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AiPlanGenerationService aiPlanGenerationService;

    @Test
    @DisplayName("POST /api/activities/plans/generate - Trả về WeeklyPlanDto ở trạng thái Preview (isActive=false)")
    void testGenerateWeeklyPlan_ActivitiesEndpoint() throws Exception {
        AiGeneratePlanRequest request = AiGeneratePlanRequest.builder()
                .userProfile(UserProfileDto.builder()
                        .userId("kc-user-888")
                        .fitnessGoal("FAT_LOSS")
                        .experience("BEGINNER")
                        .selectedDays(List.of(1, 3, 5))
                        .equipment(Set.of("BODYWEIGHT"))
                        .build())
                .build();

        WeeklyPlanDto mockPreviewPlan = WeeklyPlanDto.builder()
                .id("preview-test-123")
                .userId("kc-user-888")
                .goal("FAT_LOSS")
                .level("BEGINNER")
                .isActive(false)
                .startDate(LocalDate.of(2026, 10, 5))
                .endDate(LocalDate.of(2026, 10, 11))
                .days(List.of(
                        WorkoutDayDto.builder()
                                .dayIndex(1)
                                .dayName("T2")
                                .isRestDay(false)
                                .focus("Full Body")
                                .build()
                ))
                .build();

        when(aiPlanGenerationService.generateWeeklyPlan(any(AiGeneratePlanRequest.class)))
                .thenReturn(mockPreviewPlan);

        mockMvc.perform(post("/api/activities/plans/generate")
                        .header("X-User-ID", "kc-user-888")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("preview-test-123"))
                .andExpect(jsonPath("$.userId").value("kc-user-888"))
                .andExpect(jsonPath("$.isActive").value(false))
                .andExpect(jsonPath("$.days[0].dayName").value("T2"));
    }

    @Test
    @DisplayName("POST /api/ai/plans/generate - Hỗ trợ alias endpoint /api/ai/plans/generate")
    void testGenerateWeeklyPlan_AiAliasEndpoint() throws Exception {
        AiGeneratePlanRequest request = AiGeneratePlanRequest.builder()
                .userProfile(UserProfileDto.builder()
                        .fitnessGoal("MUSCLE_GAIN")
                        .experience("INTERMEDIATE")
                        .build())
                .build();

        WeeklyPlanDto mockPreviewPlan = WeeklyPlanDto.builder()
                .id("preview-test-456")
                .userId("kc-user-999")
                .goal("MUSCLE_GAIN")
                .isActive(false)
                .build();

        when(aiPlanGenerationService.generateWeeklyPlan(any(AiGeneratePlanRequest.class)))
                .thenReturn(mockPreviewPlan);

        mockMvc.perform(post("/api/ai/plans/generate")
                        .header("X-User-ID", "kc-user-999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("preview-test-456"))
                .andExpect(jsonPath("$.isActive").value(false));
    }
}
