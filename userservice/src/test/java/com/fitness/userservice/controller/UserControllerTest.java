package com.fitness.userservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fitness.userservice.dto.UserProfileDto;
import com.fitness.userservice.dto.UserSyncRequest;
import com.fitness.userservice.dto.UserSyncResponse;
import com.fitness.userservice.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UserService userService;

    @Test
    @DisplayName("POST /api/users/sync - Đồng bộ user từ Keycloak trả về 200 OK")
    void testSyncUser_Endpoint() throws Exception {
        UserSyncRequest request = UserSyncRequest.builder()
                .keycloakId("kc-test-123")
                .email("test@fitness.com")
                .firstName("Minh")
                .lastName("Trang")
                .build();

        UserSyncResponse mockResponse = UserSyncResponse.builder()
                .id("u-123")
                .keycloakId("kc-test-123")
                .email("test@fitness.com")
                .firstName("Minh")
                .lastName("Trang")
                .isProfileCompleted(false)
                .build();

        when(userService.syncUser(any(UserSyncRequest.class))).thenReturn(mockResponse);

        mockMvc.perform(post("/api/users/sync")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.keycloakId").value("kc-test-123"))
                .andExpect(jsonPath("$.email").value("test@fitness.com"))
                .andExpect(jsonPath("$.isProfileCompleted").value(false));
    }

    @Test
    @DisplayName("GET /api/users/{keycloakId}/profile - Lấy hồ sơ thể chất trả về 200 OK")
    void testGetProfile_Endpoint() throws Exception {
        UserProfileDto mockDto = UserProfileDto.builder()
                .userId("u-123")
                .name("Minh Trang")
                .email("test@fitness.com")
                .age(25)
                .height(170.0)
                .weight(65.0)
                .gender("MALE")
                .fitnessGoal("FAT_LOSS")
                .activityLevel("MODERATE")
                .experience("BEGINNER")
                .workoutPreferences(new HashSet<>(Arrays.asList("CARDIO", "PILATES")))
                .workoutDuration("30-45p")
                .selectedDays(Arrays.asList(1, 3, 5))
                .isProfileCompleted(true)
                .build();

        when(userService.getUserProfile("kc-test-123")).thenReturn(mockDto);

        mockMvc.perform(get("/api/users/kc-test-123/profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value("u-123"))
                .andExpect(jsonPath("$.age").value(25))
                .andExpect(jsonPath("$.height").value(170.0))
                .andExpect(jsonPath("$.fitnessGoal").value("FAT_LOSS"))
                .andExpect(jsonPath("$.experience").value("BEGINNER"))
                .andExpect(jsonPath("$.workoutDuration").value("30-45p"))
                .andExpect(jsonPath("$.isProfileCompleted").value(true));
    }

    @Test
    @DisplayName("PUT /api/users/{keycloakId}/profile - Cập nhật hồ sơ thể chất trả về 200 OK")
    void testUpdateProfile_Endpoint() throws Exception {
        UserProfileDto inputDto = UserProfileDto.builder()
                .age(26)
                .height(171.0)
                .weight(64.0)
                .gender("MALE")
                .fitnessGoal("STRENGTH")
                .activityLevel("VERY_ACTIVE")
                .experience("INTERMEDIATE")
                .workoutPreferences(new HashSet<>(Arrays.asList("STRENGTH", "HIIT")))
                .workoutDuration("45-60p")
                .selectedDays(Arrays.asList(1, 2, 4, 6))
                .limitations(new HashSet<>(Collections.singletonList("KNEE_PAIN")))
                .equipment(new HashSet<>(Arrays.asList("BODYWEIGHT", "DUMBBELL")))
                .customWishes("Tập trung core và eo")
                .build();

        UserProfileDto savedDto = UserProfileDto.builder()
                .userId("u-123")
                .age(26)
                .height(171.0)
                .weight(64.0)
                .gender("MALE")
                .fitnessGoal("STRENGTH")
                .experience("INTERMEDIATE")
                .workoutPreferences(new HashSet<>(Arrays.asList("STRENGTH", "HIIT")))
                .isProfileCompleted(true)
                .build();

        when(userService.updateUserProfile(eq("kc-test-123"), any(UserProfileDto.class))).thenReturn(savedDto);

        mockMvc.perform(put("/api/users/kc-test-123/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(inputDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value("u-123"))
                .andExpect(jsonPath("$.age").value(26))
                .andExpect(jsonPath("$.fitnessGoal").value("STRENGTH"))
                .andExpect(jsonPath("$.experience").value("INTERMEDIATE"))
                .andExpect(jsonPath("$.isProfileCompleted").value(true));
    }
}
