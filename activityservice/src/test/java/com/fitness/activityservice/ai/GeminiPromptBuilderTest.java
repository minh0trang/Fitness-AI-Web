package com.fitness.activityservice.ai;

import com.fitness.activityservice.dto.UserProfileDto;
import com.fitness.activityservice.dto.WeeklyHistorySummaryDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class GeminiPromptBuilderTest {

    private GeminiPromptBuilder promptBuilder;

    @BeforeEach
    void setUp() {
        promptBuilder = new GeminiPromptBuilder();
    }

    @Test
    @DisplayName("buildPrompt - Tuần đầu tiên (history = null) chứa thông tin profile, whitelist bài tập và JSON ONLY")
    void testBuildPrompt_FirstWeek_Success() {
        UserProfileDto profile = UserProfileDto.builder()
                .userId("kc-user-1")
                .fitnessGoal("FAT_LOSS")
                .experience("BEGINNER")
                .gender("FEMALE")
                .age(25)
                .height(160.0)
                .weight(52.0)
                .workoutDuration("30-45")
                .selectedDays(List.of(1, 3, 5))
                .equipment(Set.of("BODYWEIGHT", "YOGA_MAT"))
                .workoutPreferences(Set.of("CARDIO", "PILATES"))
                .customWishes("Tập trung giảm mỡ bụng dưới")
                .build();

        LocalDate startDate = LocalDate.of(2026, 10, 5);
        LocalDate endDate = LocalDate.of(2026, 10, 11);
        List<String> allowedCodes = List.of("WARMUP_DYNAMIC_STRETCH", "PUSH_UP", "PLANK_BASIC", "COOLDOWN_STATIC_STRETCH");

        String prompt = promptBuilder.buildPrompt(profile, null, startDate, endDate, allowedCodes);

        assertThat(prompt).isNotBlank();
        assertThat(prompt).contains("FAT_LOSS");
        assertThat(prompt).contains("BEGINNER");
        assertThat(prompt).contains("BODYWEIGHT");
        assertThat(prompt).contains("YOGA_MAT");
        assertThat(prompt).contains("[1, 3, 5]");
        assertThat(prompt).contains("First week of training after Onboarding");
        assertThat(prompt).contains("2026-10-05");
        assertThat(prompt).contains("2026-10-11");
        assertThat(prompt).contains("WARMUP_DYNAMIC_STRETCH, PUSH_UP, PLANK_BASIC, COOLDOWN_STATIC_STRETCH");
        assertThat(prompt).contains("JSON ONLY");
        assertThat(prompt).contains("DO NOT include exercise names or YouTube video URLs");
    }

    @Test
    @DisplayName("buildPrompt - Tuần thích ứng chứa painReports dưới dạng application constraints và tín hiệu mệt mỏi")
    void testBuildPrompt_AdaptiveWeek_WithPainReportsAndFatigue() {
        UserProfileDto profile = UserProfileDto.builder()
                .userId("kc-user-2")
                .fitnessGoal("MUSCLE_GAIN")
                .experience("INTERMEDIATE")
                .selectedDays(List.of(1, 2, 4, 5))
                .equipment(Set.of("BODYWEIGHT", "DUMBBELL"))
                .build();

        WeeklyHistorySummaryDto history = WeeklyHistorySummaryDto.builder()
                .completionRate(75.0)
                .actualMinutes(150)
                .targetMinutes(200)
                .averageDifficulty(4.3)
                .averageEnergy(2.1)
                .painReports(List.of("KNEE_PAIN", "LOWER_BACK"))
                .focusDistribution(Map.of("Legs", 2, "Chest", 1))
                .build();

        LocalDate startDate = LocalDate.of(2026, 10, 12);
        LocalDate endDate = LocalDate.of(2026, 10, 18);
        List<String> allowedCodes = List.of("WARMUP_DYNAMIC_STRETCH", "GLUTE_BRIDGE", "BIRD_DOG", "COOLDOWN_STATIC_STRETCH");

        String prompt = promptBuilder.buildPrompt(profile, history, startDate, endDate, allowedCodes);

        assertThat(prompt).contains("KNEE_PAIN, LOWER_BACK");
        assertThat(prompt).contains("APPLICATION CONSTRAINT: Treat reported pain as motion exclusion filters");
        assertThat(prompt).contains("High fatigue detected");
        assertThat(prompt).contains("75.0%");
    }
}
