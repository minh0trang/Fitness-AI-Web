import React from "react";
import { Box } from "@mui/material";
import MiniMetricCards from "../components/dashboard/MiniMetricCards";
import WeeklyCalorieChart from "../components/dashboard/WeeklyCalorieChart";
import WeightProgressWidget from "../components/dashboard/WeightProgressWidget";
import BmiGaugeWidget from "../components/dashboard/BmiGaugeWidget";
import { WEEKLY_CHART_DATA, WEIGHT_HISTORY_DATA } from "../data/mockWorkouts";

export default function DashboardPage({ schedule, profile, journalEntries }) {
  const totalCaloriesBurned = journalEntries?.reduce(
    (acc, cur) => acc + (cur.caloriesBurned || 0),
    0
  ) || 465;

  const totalMinutes = journalEntries?.reduce(
    (acc, cur) => acc + (cur.durationMinutes || 0),
    0
  ) || 47;

  const weeklyTarget = 1800;

  return (
    <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", gap: 1.2, overflow: "hidden" }}>
      {/* Top: 4 Mini Visualizations (Row 1) */}
      <MiniMetricCards
        caloriesBurned={totalCaloriesBurned}
        calorieTarget={weeklyTarget}
        trainingMinutes={totalMinutes}
        trainingTarget={150}
        workoutsCompleted={3}
        workoutsTarget={5}
        streakDays={4}
      />

      {/* Main Analytics: Left Column (60%) expanded Calorie Chart, Right Column (40%) Weight + BMI Gauge */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "6fr 4fr" },
          gridTemplateRows: { md: "1fr 1fr" },
          gap: 1.2,
          flex: 1,
          minHeight: 0,
          width: "100%",
          overflow: "hidden",
        }}
      >
        {/* Left Column (60%): Expands to cover full height across both rows */}
        <Box sx={{ gridRow: { md: "span 2" }, minHeight: 0, height: "100%" }}>
          <WeeklyCalorieChart chartData={WEEKLY_CHART_DATA} />
        </Box>

        {/* Right Column - Top (40%): Weight Progress */}
        <Box sx={{ minHeight: 0, height: "100%" }}>
          <WeightProgressWidget data={WEIGHT_HISTORY_DATA} />
        </Box>

        {/* Right Column - Bottom (40%): BMI Gauge Chart */}
        <Box sx={{ minHeight: 0, height: "100%" }}>
          <BmiGaugeWidget
            height={profile?.height || 162}
            weight={profile?.weight || 70.5}
          />
        </Box>
      </Box>
    </Box>
  );
}
