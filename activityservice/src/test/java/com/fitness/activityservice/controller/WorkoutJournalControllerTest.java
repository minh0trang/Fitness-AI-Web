package com.fitness.activityservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fitness.activityservice.dto.WorkoutJournalRequest;
import com.fitness.activityservice.dto.WorkoutJournalResponse;
import com.fitness.activityservice.service.WorkoutJournalService;
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

@WebMvcTest(WorkoutJournalController.class)
class WorkoutJournalControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private WorkoutJournalService workoutJournalService;

    @Test
    @DisplayName("POST /api/activities/journals - Tạo journal thành công trả về 201 Created")
    void testRecordJournal_Endpoint_Success() throws Exception {
        WorkoutJournalRequest request = WorkoutJournalRequest.builder()
                .planId("plan-123")
                .dayIndex(1)
                .workoutTitle("Core & Abs Blast")
                .workoutDate(LocalDate.now())
                .actualDurationMinutes(40)
                .plannedDurationMinutes(42)
                .plannedIntensity("Moderate")
                .caloriesBurned(200)
                .difficulty(3)
                .energy(4)
                .hasPain(false)
                .build();

        WorkoutJournalResponse mockResponse = WorkoutJournalResponse.builder()
                .id("j-001")
                .userId("kc-user-777")
                .planId("plan-123")
                .dayIndex(1)
                .workoutTitle("Core & Abs Blast")
                .difficulty(3)
                .energy(4)
                .build();

        when(workoutJournalService.recordJournal(eq("kc-user-777"), any(WorkoutJournalRequest.class)))
                .thenReturn(mockResponse);

        mockMvc.perform(post("/api/activities/journals")
                        .header("X-User-ID", "kc-user-777")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("j-001"))
                .andExpect(jsonPath("$.userId").value("kc-user-777"))
                .andExpect(jsonPath("$.difficulty").value(3))
                .andExpect(jsonPath("$.energy").value(4));
    }

    @Test
    @DisplayName("POST /api/activities/journals - Payload lỗi validation trả về 400 Bad Request")
    void testRecordJournal_ValidationError() throws Exception {
        // Missing planId and dayIndex
        WorkoutJournalRequest request = WorkoutJournalRequest.builder()
                .difficulty(6) // Invalid (>5)
                .energy(0)     // Invalid (<1)
                .build();

        when(workoutJournalService.recordJournal(eq("kc-user-777"), any(WorkoutJournalRequest.class)))
                .thenThrow(new IllegalArgumentException("Difficulty must be between 1 and 5"));

        mockMvc.perform(post("/api/activities/journals")
                        .header("X-User-ID", "kc-user-777")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/activities/journals/{id} - Lấy chi tiết journal trả về 200 OK")
    void testGetJournalById_Endpoint() throws Exception {
        WorkoutJournalResponse mockResponse = WorkoutJournalResponse.builder()
                .id("j-001")
                .userId("kc-user-777")
                .planId("plan-123")
                .dayIndex(1)
                .difficulty(3)
                .energy(4)
                .build();

        when(workoutJournalService.getJournalById("kc-user-777", "j-001"))
                .thenReturn(mockResponse);

        mockMvc.perform(get("/api/activities/journals/j-001")
                        .header("X-User-ID", "kc-user-777"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("j-001"))
                .andExpect(jsonPath("$.energy").value(4));
    }

    @Test
    @DisplayName("GET /api/activities/journals - Lấy danh sách journal của user dựa vào X-User-ID")
    void testGetUserJournals_Endpoint() throws Exception {
        WorkoutJournalResponse mockResponse = WorkoutJournalResponse.builder()
                .id("j-001")
                .userId("kc-user-777")
                .difficulty(3)
                .energy(4)
                .build();

        when(workoutJournalService.getUserJournals("kc-user-777"))
                .thenReturn(Collections.singletonList(mockResponse));

        mockMvc.perform(get("/api/activities/journals")
                        .header("X-User-ID", "kc-user-777"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("j-001"));
    }
}
