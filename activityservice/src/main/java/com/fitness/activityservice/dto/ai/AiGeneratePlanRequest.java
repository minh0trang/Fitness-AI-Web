package com.fitness.activityservice.dto.ai;

import com.fitness.activityservice.dto.UserProfileDto;
import com.fitness.activityservice.dto.WeeklyHistorySummaryDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiGeneratePlanRequest {

    private UserProfileDto userProfile;

    /**
     * Tóm tắt lịch sử tuần trước (null nếu là tuần đầu tiên sau Onboarding).
     */
    private WeeklyHistorySummaryDto previousWeekSummary;

    /**
     * Ngày bắt đầu và kết thúc của tuần mục tiêu.
     */
    private TargetWeekDto targetWeek;
}
