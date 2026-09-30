import React from "react";
import { Box, Card, CardContent, Typography, CircularProgress, LinearProgress } from "@mui/material";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import TimerIcon from "@mui/icons-material/Timer";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

export default function MiniMetricCards({
  caloriesBurned = 465,
  calorieTarget = 1800,
  trainingMinutes = 47,
  trainingTarget = 150,
  workoutsCompleted = 3,
  workoutsTarget = 5,
  streakDays = 4,
}) {
  const calPercent = Math.min(100, Math.round((caloriesBurned / calorieTarget) * 100));
  const timePercent = Math.min(100, Math.round((trainingMinutes / trainingTarget) * 100));
  const workoutPercent = Math.min(100, Math.round((workoutsCompleted / workoutsTarget) * 100));

  // 7 days of the week: T2 to CN
  const weekDays = [
    { label: "T2", active: streakDays >= 1 },
    { label: "T3", active: streakDays >= 2 },
    { label: "T4", active: streakDays >= 3 },
    { label: "T5", active: streakDays >= 4 },
    { label: "T6", active: streakDays >= 5 },
    { label: "T7", active: streakDays >= 6 },
    { label: "CN", active: streakDays >= 7 },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(4, 1fr)",
        },
        gap: 1.25,
        width: "100%",
        flexShrink: 0,
      }}
    >
      {/* 1. Calories Donut Card */}
      <Card
        sx={{
          borderRadius: "16px",
          border: "1px solid #E5E7EB",
          bgcolor: "#FFFFFF",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
          transition: "transform 0.15s ease",
          "&:hover": { transform: "translateY(-1px)", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)" },
        }}
      >
        <CardContent
          sx={{
            p: 1.3,
            "&:last-child": { pb: 1.3 },
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748B", textTransform: "uppercase", fontSize: "0.65rem", letterSpacing: "0.03em" }}>
              Calories
            </Typography>
            <LocalFireDepartmentIcon sx={{ fontSize: 16, color: "#10B981" }} />
          </Box>

          {/* Body: Value on left, Large Donut ring on right */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, my: 0.3 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body1" sx={{ fontWeight: 850, color: "#0F172A", lineHeight: 1.15, fontSize: "1.15rem" }}>
                {caloriesBurned}{" "}
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748B" }}>
                  / {calorieTarget} kcal
                </span>
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontSize: "0.68rem",
                  color: "#059669",
                  fontWeight: 700,
                  display: "block",
                  mt: 0.4,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Đã đốt ~{caloriesBurned} kcal hôm nay
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontSize: "0.62rem",
                  color: "#64748B",
                  fontWeight: 600,
                  display: "block",
                  mt: 0.1,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Còn {Math.max(0, calorieTarget - caloriesBurned)} kcal để đạt chỉ tiêu
              </Typography>
            </Box>

            {/* Prominent Donut Ring (64px) */}
            <Box sx={{ position: "relative", display: "inline-flex", flexShrink: 0 }}>
              <CircularProgress
                variant="determinate"
                value={100}
                size={64}
                thickness={5.5}
                sx={{ color: "#F1F5F9" }}
              />
              <CircularProgress
                variant="determinate"
                value={calPercent}
                size={64}
                thickness={5.5}
                sx={{
                  color: "#10B981",
                  position: "absolute",
                  left: 0,
                  strokeLinecap: "round",
                }}
              />
              <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <Typography variant="body2" sx={{ fontWeight: 850, fontSize: "0.95rem", color: "#0F172A", lineHeight: 1 }}>
                  {calPercent}%
                </Typography>
                <Typography variant="caption" sx={{ fontSize: "0.55rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", mt: 0.2 }}>
                  Đạt
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* 2. Training Time Mini Progress Bar */}
      <Card
        sx={{
          borderRadius: "16px",
          border: "1px solid #E5E7EB",
          bgcolor: "#FFFFFF",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
          transition: "transform 0.15s ease",
          "&:hover": { transform: "translateY(-1px)", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)" },
        }}
      >
        <CardContent
          sx={{
            p: 1.3,
            "&:last-child": { pb: 1.3 },
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748B", textTransform: "uppercase", fontSize: "0.65rem", letterSpacing: "0.03em" }}>
              Training Time
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: "#0284C7", fontSize: "0.72rem" }}>
                {timePercent}%
              </Typography>
              <TimerIcon sx={{ fontSize: 16, color: "#0284C7" }} />
            </Box>
          </Box>

          <Box sx={{ my: 0.3 }}>
            <Typography variant="body1" sx={{ fontWeight: 850, color: "#0F172A", lineHeight: 1.15, fontSize: "1.15rem" }}>
              {trainingMinutes}{" "}
              <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748B" }}>
                / {trainingTarget} min
              </span>
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.68rem",
                color: "#0284C7",
                fontWeight: 700,
                display: "block",
                mt: 0.4,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Đã tập {trainingMinutes} phút tuần này
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.62rem",
                color: "#64748B",
                fontWeight: 600,
                display: "block",
                mt: 0.1,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Còn {Math.max(0, trainingTarget - trainingMinutes)} phút nữa để về đích
            </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={timePercent}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: "#E0F2FE",
              "& .MuiLinearProgress-bar": { bgcolor: "#0284C7", borderRadius: 3 },
            }}
          />
        </CardContent>
      </Card>

      {/* 3. Workout Completion Donut Ring */}
      <Card
        sx={{
          borderRadius: "16px",
          border: "1px solid #E5E7EB",
          bgcolor: "#FFFFFF",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
          transition: "transform 0.15s ease",
          "&:hover": { transform: "translateY(-1px)", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)" },
        }}
      >
        <CardContent
          sx={{
            p: 1.3,
            "&:last-child": { pb: 1.3 },
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748B", textTransform: "uppercase", fontSize: "0.65rem", letterSpacing: "0.03em" }}>
              Workouts
            </Typography>
            <FitnessCenterIcon sx={{ fontSize: 16, color: "#D97706" }} />
          </Box>

          {/* Body: Value on left, Large Donut ring on right */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, my: 0.3 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body1" sx={{ fontWeight: 850, color: "#0F172A", lineHeight: 1.15, fontSize: "1.15rem" }}>
                {workoutsCompleted}{" "}
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748B" }}>
                  / {workoutsTarget} buổi
                </span>
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontSize: "0.68rem",
                  color: workoutsCompleted >= workoutsTarget ? "#059669" : "#D97706",
                  fontWeight: 700,
                  display: "block",
                  mt: 0.4,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {workoutsCompleted >= workoutsTarget
                  ? "Hoàn thành mục tiêu tuần 🎉"
                  : "Đúng tiến độ tuần này 🔥"}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontSize: "0.62rem",
                  color: "#64748B",
                  fontWeight: 600,
                  display: "block",
                  mt: 0.1,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Còn lại {Math.max(0, workoutsTarget - workoutsCompleted)} buổi cần check-in
              </Typography>
            </Box>

            {/* Prominent Donut Ring (64px) */}
            <Box sx={{ position: "relative", display: "inline-flex", flexShrink: 0 }}>
              <CircularProgress
                variant="determinate"
                value={100}
                size={64}
                thickness={5.5}
                sx={{ color: "#F1F5F9" }}
              />
              <CircularProgress
                variant="determinate"
                value={workoutPercent}
                size={64}
                thickness={5.5}
                sx={{
                  color: "#D97706",
                  position: "absolute",
                  left: 0,
                  strokeLinecap: "round",
                }}
              />
              <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <Typography variant="body2" sx={{ fontWeight: 850, fontSize: "0.95rem", color: "#0F172A", lineHeight: 1 }}>
                  {workoutPercent}%
                </Typography>
                <Typography variant="caption" sx={{ fontSize: "0.55rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", mt: 0.2 }}>
                  Tiến độ
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* 4. Streak: 7 Day Dots ● ● ● ● ○ ○ ○ */}
      <Card
        sx={{
          borderRadius: "16px",
          border: "1px solid #E5E7EB",
          bgcolor: "#FFFFFF",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
          transition: "transform 0.15s ease",
          "&:hover": { transform: "translateY(-1px)", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)" },
        }}
      >
        <CardContent
          sx={{
            p: 1.3,
            "&:last-child": { pb: 1.3 },
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748B", textTransform: "uppercase", fontSize: "0.65rem", letterSpacing: "0.03em" }}>
              Chuỗi Kỷ Luật
            </Typography>
            <EmojiEventsIcon sx={{ fontSize: 16, color: "#F59E0B" }} />
          </Box>

          <Box sx={{ my: 0.3 }}>
            <Typography variant="body1" sx={{ fontWeight: 850, color: "#0F172A", lineHeight: 1.15, fontSize: "1.15rem" }}>
              {streakDays} ngày{" "}
              <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748B" }}>
                liên tiếp
              </span>
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.68rem",
                color: "#059669",
                fontWeight: 700,
                display: "block",
                mt: 0.4,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Đang duy trì phong độ tập luyện 🔥
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.62rem",
                color: "#64748B",
                fontWeight: 600,
                display: "block",
                mt: 0.1,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              T2 - T5 đều hoàn thành đúng kế hoạch
            </Typography>
          </Box>

          {/* 7 Day Dots ● ● ● ● ○ ○ ○ */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 0.2 }}>
            {weekDays.map((d, i) => (
              <Box key={i} sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.2 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: d.active ? "#10B981" : "#E2E8F0",
                    boxShadow: d.active ? "0 0 6px rgba(16, 185, 129, 0.4)" : "none",
                    transition: "all 0.2s ease",
                  }}
                />
                <Typography variant="caption" sx={{ fontSize: "0.58rem", fontWeight: d.active ? 700 : 500, color: d.active ? "#059669" : "#94A3B8" }}>
                  {d.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
