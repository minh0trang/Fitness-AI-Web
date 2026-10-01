package com.fitness.activityservice.service;

import com.fitness.activityservice.dto.WeeklyHistorySummaryDto;
import com.fitness.activityservice.model.WeeklyPlan;
import com.fitness.activityservice.model.WorkoutDay;
import com.fitness.activityservice.model.WorkoutJournal;
import com.fitness.activityservice.repository.WeeklyPlanRepository;
import com.fitness.activityservice.repository.WorkoutJournalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WeeklyHistorySummaryService {

    private final WeeklyPlanRepository weeklyPlanRepository;
    private final WorkoutJournalRepository workoutJournalRepository;

    /**
     * Lấy tóm tắt tuần vừa kết thúc của user (dùng cho AI sinh plan tuần mới).
     * Trả về Optional.empty() nếu user chưa có tuần nào kết thúc trước ngày hôm nay (tuần đầu tiên).
     */
    public Optional<WeeklyHistorySummaryDto> getPreviousWeekSummary(String userId) {
        log.info("Computing previous week summary for userId: {}", userId);

        LocalDate today = LocalDate.now();
        Optional<WeeklyPlan> previousPlanOpt = weeklyPlanRepository
                .findFirstByUserIdAndEndDateBeforeOrderByEndDateDesc(userId, today);

        if (previousPlanOpt.isEmpty()) {
            log.info("No completed previous week plan found for userId: {}", userId);
            return Optional.empty();
        }

        WeeklyPlan plan = previousPlanOpt.get();
        List<WorkoutJournal> journals = workoutJournalRepository.findByUserIdAndPlanId(userId, plan.getId());

        WeeklyHistorySummaryDto summary = buildSummary(plan, journals);
        return Optional.of(summary);
    }

    /**
     * Lấy tóm tắt chi tiết của một WeeklyPlan xác định theo planId.
     */
    public WeeklyHistorySummaryDto getSummaryByPlanId(String userId, String planId) {
        log.info("Computing summary for planId: {}, userId: {}", planId, userId);

        WeeklyPlan plan = weeklyPlanRepository.findById(planId)
                .orElseThrow(() -> new IllegalArgumentException("WeeklyPlan not found for id: " + planId));

        if (!userId.equals(plan.getUserId())) {
            throw new IllegalArgumentException("Unauthorized access to plan: " + planId);
        }

        List<WorkoutJournal> journals = workoutJournalRepository.findByUserIdAndPlanId(userId, planId);
        return buildSummary(plan, journals);
    }

    /**
     * Hàm tổng hợp các chỉ số tuần theo các quy tắc nghiệp vụ đã chốt:
     * - Chỉ tính trên scheduled days (isRestDay == false).
     * - Không dùng workoutTitle làm focus fallback.
     */
    WeeklyHistorySummaryDto buildSummary(WeeklyPlan plan, List<WorkoutJournal> journals) {
        List<WorkoutDay> allDays = plan.getDays() != null ? plan.getDays() : Collections.emptyList();

        // 1. Lọc các ngày có lịch tập (scheduled days)
        List<WorkoutDay> scheduledDays = allDays.stream()
                .filter(d -> !Boolean.TRUE.equals(d.getIsRestDay()))
                .toList();

        int totalScheduledDays = scheduledDays.size();

        // 2. targetMinutes = tổng phút của các ngày scheduled
        int targetMinutes = scheduledDays.stream()
                .mapToInt(d -> d.getTotalMinutes() != null ? d.getTotalMinutes() : 0)
                .sum();

        // Map scheduled days theo dayIndex
        Map<Integer, WorkoutDay> scheduledDayMap = scheduledDays.stream()
                .filter(d -> d.getDayIndex() != null)
                .collect(Collectors.toMap(WorkoutDay::getDayIndex, Function.identity(), (d1, d2) -> d1));

        // 3. Lọc journals hợp lệ tương ứng với scheduled days
        List<WorkoutJournal> safeJournals = journals != null ? journals : Collections.emptyList();
        List<WorkoutJournal> validJournals = safeJournals.stream()
                .filter(j -> j.getDayIndex() != null && scheduledDayMap.containsKey(j.getDayIndex()))
                .toList();

        int completedDays = validJournals.size();

        // 4. completionRate = (completedDays * 100.0) / totalScheduledDays (làm tròn 1 chữ số thập phân)
        double rawCompletionRate = totalScheduledDays == 0 ? 0.0 : ((double) completedDays * 100.0) / totalScheduledDays;
        double completionRate = roundToOneDecimal(rawCompletionRate);

        // 5. actualMinutes = tổng phút thực tế từ valid journals
        int actualMinutes = validJournals.stream()
                .mapToInt(j -> j.getActualDurationMinutes() != null ? j.getActualDurationMinutes() : 0)
                .sum();

        // 6. averageDifficulty & averageEnergy (làm tròn 1 chữ số thập phân)
        double rawAvgDifficulty = validJournals.stream()
                .filter(j -> j.getDifficulty() != null)
                .mapToInt(WorkoutJournal::getDifficulty)
                .average()
                .orElse(0.0);
        double averageDifficulty = roundToOneDecimal(rawAvgDifficulty);

        double rawAvgEnergy = validJournals.stream()
                .filter(j -> j.getEnergy() != null)
                .mapToInt(WorkoutJournal::getEnergy)
                .average()
                .orElse(0.0);
        double averageEnergy = roundToOneDecimal(rawAvgEnergy);

        // 7. painReports (distinct, sorted từ các ngày hasPain == true)
        List<String> painReports = validJournals.stream()
                .filter(j -> Boolean.TRUE.equals(j.getHasPain()) && j.getPainLocations() != null)
                .flatMap(j -> j.getPainLocations().stream())
                .filter(p -> p != null && !p.trim().isEmpty())
                .distinct()
                .sorted()
                .toList();

        // 8. focusDistribution (chỉ lấy từ WorkoutDay.focus, không fallback sang workoutTitle)
        Map<String, Integer> focusDistribution = new LinkedHashMap<>();
        for (WorkoutJournal j : validJournals) {
            WorkoutDay day = scheduledDayMap.get(j.getDayIndex());
            if (day != null && day.getFocus() != null && !day.getFocus().trim().isEmpty()) {
                String focus = day.getFocus().trim();
                focusDistribution.put(focus, focusDistribution.getOrDefault(focus, 0) + 1);
            }
        }

        return WeeklyHistorySummaryDto.builder()
                .planId(plan.getId())
                .weekStartDate(plan.getStartDate())
                .weekEndDate(plan.getEndDate())
                .totalScheduledDays(totalScheduledDays)
                .completedDays(completedDays)
                .completionRate(completionRate)
                .actualMinutes(actualMinutes)
                .targetMinutes(targetMinutes)
                .averageDifficulty(averageDifficulty)
                .averageEnergy(averageEnergy)
                .painReports(painReports)
                .focusDistribution(focusDistribution)
                .build();
    }

    private double roundToOneDecimal(double val) {
        return Math.round(val * 10.0) / 10.0;
    }
}
