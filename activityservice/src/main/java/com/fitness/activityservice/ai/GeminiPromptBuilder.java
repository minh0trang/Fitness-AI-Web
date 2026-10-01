package com.fitness.activityservice.ai;

import com.fitness.activityservice.dto.UserProfileDto;
import com.fitness.activityservice.dto.WeeklyHistorySummaryDto;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Component
public class GeminiPromptBuilder {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;

    /**
     * Xây dựng Prompt chuẩn hóa gửi tới Gemini AI với các ràng buộc nghiêm ngặt:
     * - Output JSON ONLY (không markdown, không giải thích).
     * - Chỉ sử dụng mã exerciseCode từ danh mục cho phép.
     * - Không sinh URL, video hay tên bài tập tự do.
     * - Xử lý painReports và limitations dưới dạng Application Constraints.
     */
    public String buildPrompt(
            UserProfileDto profile,
            WeeklyHistorySummaryDto history,
            LocalDate startDate,
            LocalDate endDate,
            List<String> allowedExerciseCodes) {

        StringBuilder sb = new StringBuilder();

        sb.append("You are an elite, certified AI Fitness Coach and Exercise Physiologist.\n");
        sb.append("Generate a personalized 7-day Weekly Workout Plan in strict JSON format.\n\n");

        // 1. User Profile Section
        sb.append("### 1. USER PROFILE\n");
        if (profile != null) {
            sb.append("- Fitness Goal: ").append(profile.getFitnessGoal() != null ? profile.getFitnessGoal() : "GENERAL_FITNESS").append("\n");
            sb.append("- Experience Level: ").append(profile.getExperience() != null ? profile.getExperience() : "BEGINNER").append("\n");
            sb.append("- Gender: ").append(profile.getGender() != null ? profile.getGender() : "NOT_SPECIFIED").append("\n");
            if (profile.getAge() != null) sb.append("- Age: ").append(profile.getAge()).append("\n");
            if (profile.getHeight() != null) sb.append("- Height: ").append(profile.getHeight()).append(" cm\n");
            if (profile.getWeight() != null) sb.append("- Weight: ").append(profile.getWeight()).append(" kg\n");

            sb.append("- Preferred Session Duration: ").append(profile.getWorkoutDuration() != null ? profile.getWorkoutDuration() : "30-45").append(" minutes\n");

            Set<String> equip = (profile.getEquipment() != null && !profile.getEquipment().isEmpty())
                    ? profile.getEquipment()
                    : Set.of("BODYWEIGHT");
            sb.append("- Available Equipment: ").append(String.join(", ", equip)).append("\n");

            List<Integer> days = (profile.getSelectedDays() != null && !profile.getSelectedDays().isEmpty())
                    ? profile.getSelectedDays()
                    : List.of(1, 3, 5);
            sb.append("- Selected Workout Days (1=Mon ... 7=Sun): ").append(days).append("\n");

            if (profile.getWorkoutPreferences() != null && !profile.getWorkoutPreferences().isEmpty()) {
                sb.append("- Workout Preferences: ").append(String.join(", ", profile.getWorkoutPreferences())).append("\n");
            }
            if (profile.getLimitations() != null && !profile.getLimitations().isEmpty()) {
                sb.append("- Physical Limitations: ").append(String.join(", ", profile.getLimitations())).append("\n");
            }
            if (profile.getCustomWishes() != null && !profile.getCustomWishes().isBlank()) {
                sb.append("- Custom Wishes: ").append(profile.getCustomWishes().trim()).append("\n");
            }
        } else {
            sb.append("- Level: BEGINNER, Goal: GENERAL_FITNESS, Equipment: BODYWEIGHT, Selected Days: [1, 3, 5]\n");
        }
        sb.append("\n");

        // 2. Previous Week Adaptation Signals
        sb.append("### 2. PREVIOUS WEEK ADAPTATION SIGNALS\n");
        if (history != null) {
            sb.append("- Completion Rate: ").append(history.getCompletionRate() != null ? history.getCompletionRate() : 0.0).append("%\n");
            sb.append("- Actual Workout Time: ").append(history.getActualMinutes() != null ? history.getActualMinutes() : 0)
                    .append(" / ").append(history.getTargetMinutes() != null ? history.getTargetMinutes() : 0).append(" minutes\n");
            sb.append("- Average Perceived Difficulty: ").append(history.getAverageDifficulty() != null ? history.getAverageDifficulty() : "N/A").append(" / 5.0\n");
            sb.append("- Average Energy Level: ").append(history.getAverageEnergy() != null ? history.getAverageEnergy() : "N/A").append(" / 5.0\n");

            if (history.getPainReports() != null && !history.getPainReports().isEmpty()) {
                sb.append("- Discomfort / Pain Reports: ").append(String.join(", ", history.getPainReports())).append("\n");
                sb.append("  * APPLICATION CONSTRAINT: Treat reported pain as motion exclusion filters. DO NOT prescribe exercises placing heavy load/impact on these areas.\n");
            }
            if (history.getFocusDistribution() != null && !history.getFocusDistribution().isEmpty()) {
                sb.append("- Previous Focus Distribution: ").append(history.getFocusDistribution()).append("\n");
            }

            if (history.getAverageDifficulty() != null && history.getAverageDifficulty() >= 4.0) {
                sb.append("  * High fatigue detected: Schedule a moderate deload or active recovery emphasis.\n");
            }
        } else {
            sb.append("- First week of training after Onboarding. Build an accessible baseline foundation.\n");
        }
        sb.append("\n");

        // 3. Target Week Schedule & Constraints
        sb.append("### 3. SCHEDULE & TARGET DATES\n");
        sb.append("- Target Week: from ").append(startDate != null ? startDate.format(DATE_FORMATTER) : "N/A")
                .append(" to ").append(endDate != null ? endDate.format(DATE_FORMATTER) : "N/A").append("\n");
        sb.append("- The plan MUST contain exactly 7 days: dayIndex 1 (Monday) to 7 (Sunday).\n\n");

        // 4. Allowed Exercise Codes (WHITELIST)
        sb.append("### 4. ALLOWED EXERCISE CODES (STRICT CATALOG WHITELIST)\n");
        sb.append("You MUST ONLY choose exercises from this exact list of allowed codes:\n");
        if (allowedExerciseCodes != null && !allowedExerciseCodes.isEmpty()) {
            sb.append(String.join(", ", allowedExerciseCodes)).append("\n");
        } else {
            sb.append("PUSH_UP, BODYWEIGHT_SQUAT, GLUTE_BRIDGE, PLANK_BASIC, WARMUP_DYNAMIC_STRETCH, COOLDOWN_STATIC_STRETCH\n");
        }
        sb.append("STRICT RULES:\n");
        sb.append("1. DO NOT invent, alter, or use any code outside this list. Any unauthorized code will be rejected.\n");
        sb.append("2. DO NOT include exercise names or YouTube video URLs. The backend catalog will resolve them.\n\n");

        // 5. Structure & Phases
        sb.append("### 5. PLAN RULES & PHASES\n");
        sb.append("- Scheduled Days (matching user's selectedDays):\n");
        sb.append("  * isRestDay: false\n");
        sb.append("  * exercises: MUST NOT be empty.\n");
        sb.append("  * MUST include all 3 phases in order: at least one 'WARMUP', at least one 'MAIN', and at least one 'COOLDOWN'.\n");
        sb.append("  * Each exercise: phase ('WARMUP'|'MAIN'|'COOLDOWN'), exerciseCode (from whitelist), durationMinutes (integer > 0), order (1, 2, 3...).\n");
        sb.append("- Rest Days (not in selectedDays):\n");
        sb.append("  * isRestDay: true\n");
        sb.append("  * focus: 'Rest'\n");
        sb.append("  * intensity: 'Low'\n");
        sb.append("  * totalMinutes: 0\n");
        sb.append("  * exercises: [] (empty list)\n\n");

        // 6. Output Schema
        sb.append("### 6. OUTPUT FORMAT: JSON ONLY\n");
        sb.append("Return ONLY pure, valid JSON with no markdown wrapping (do NOT use ```json or ```). Format:\n");
        sb.append("{\n");
        sb.append("  \"goal\": \"string\",\n");
        sb.append("  \"level\": \"BEGINNER|INTERMEDIATE|ADVANCED\",\n");
        sb.append("  \"durationPerSession\": \"30-45\",\n");
        sb.append("  \"frequencyPerWeek\": 5,\n");
        sb.append("  \"weeklyOverview\": \"Detailed summary of the week's goals and structure\",\n");
        sb.append("  \"coachTip\": \"Empathetic advice reflecting previous week performance and current plan goals\",\n");
        sb.append("  \"days\": [\n");
        sb.append("    {\n");
        sb.append("      \"dayIndex\": 1,\n");
        sb.append("      \"dayName\": \"T2\",\n");
        sb.append("      \"focus\": \"Core & Chest\",\n");
        sb.append("      \"intensity\": \"Moderate\",\n");
        sb.append("      \"totalMinutes\": 35,\n");
        sb.append("      \"isRestDay\": false,\n");
        sb.append("      \"exercises\": [\n");
        sb.append("        {\"phase\": \"WARMUP\", \"exerciseCode\": \"WARMUP_DYNAMIC_STRETCH\", \"durationMinutes\": 5, \"order\": 1},\n");
        sb.append("        {\"phase\": \"MAIN\", \"exerciseCode\": \"PUSH_UP\", \"durationMinutes\": 20, \"order\": 2},\n");
        sb.append("        {\"phase\": \"COOLDOWN\", \"exerciseCode\": \"COOLDOWN_STATIC_STRETCH\", \"durationMinutes\": 10, \"order\": 3}\n");
        sb.append("      ]\n");
        sb.append("    }\n");
        sb.append("  ]\n");
        sb.append("}\n");

        return sb.toString();
    }
}
