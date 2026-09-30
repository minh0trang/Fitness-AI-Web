import React from "react";
import { Box, Card, CardContent, Typography, Button, LinearProgress, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

export default function TodayWorkoutWidget({ routine }) {
  const navigate = useNavigate();

  // Fallback if no specific routine passed
  const routineData = routine || {
    focusTitle: "Đốt Mỡ Toàn Thân & Siết Eo",
    totalCalories: 465,
    totalMinutes: 47,
    warmup: { title: "7 Phút Kích Hoạt Cơ Bắp", durationMinutes: 7 },
    mainWorkouts: [
      { title: "20 Min Full Body HIIT Fat Burn", durationMinutes: 20 },
      { title: "15 Min Standing Abs & Slim Waist", durationMinutes: 15 },
    ],
    cooldown: { title: "10 Phút Giãn Cơ Toàn Thân", durationMinutes: 10 },
  };

  // Compile list of today's exercises
  const exercises = [];
  if (routineData.warmup) {
    exercises.push({
      type: "Khởi động",
      title: routineData.warmup.title,
      duration: routineData.warmup.durationMinutes,
      done: true,
    });
  }
  if (routineData.mainWorkouts) {
    routineData.mainWorkouts.forEach((m, idx) => {
      exercises.push({
        type: `Bài chính ${idx + 1}`,
        title: m.title,
        duration: m.durationMinutes,
        done: idx === 0, // First main done, second pending
      });
    });
  }
  if (routineData.cooldown) {
    exercises.push({
      type: "Giãn cơ",
      title: routineData.cooldown.title,
      duration: routineData.cooldown.durationMinutes,
      done: false,
    });
  }

  const completedCount = exercises.filter((e) => e.done).length;
  const totalCount = exercises.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <Card
      sx={{
        borderRadius: "16px",
        border: "1px solid #E5E7EB",
        bgcolor: "#FFFFFF",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <CardContent sx={{ p: 1.2, "&:last-child": { pb: 1.2 }, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0 }}>
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mb: 0.2 }}>
              <FitnessCenterIcon sx={{ fontSize: 15, color: "#16A34A" }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#15803D", textTransform: "uppercase", fontSize: "0.62rem" }}>
                Bài Tập Hôm Nay
              </Typography>
            </Box>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 800,
                color: "#0F172A",
                lineHeight: 1.15,
                fontSize: "0.85rem",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {routineData.focusTitle}
            </Typography>
          </Box>

          <Chip
            label={`🔥 ~${routineData.totalCalories} kcal • ${routineData.totalMinutes}p`}
            size="small"
            sx={{
              height: 20,
              fontSize: "0.62rem",
              fontWeight: 700,
              bgcolor: "#ECFDF5",
              color: "#059669",
              flexShrink: 0,
            }}
          />
        </Box>

        {/* Progress Bar & Counter */}
        <Box sx={{ flexShrink: 0, my: 0.3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.3 }}>
            <Typography variant="caption" sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#475569" }}>
              Tiến độ: {completedCount}/{totalCount} bài tập hoàn thành
            </Typography>
            <Typography variant="caption" sx={{ fontSize: "0.65rem", fontWeight: 800, color: "#10B981" }}>
              {progressPercent}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progressPercent}
            sx={{
              height: 5,
              borderRadius: 2.5,
              bgcolor: "#E2E8F0",
              "& .MuiLinearProgress-bar": { bgcolor: "#10B981", borderRadius: 2.5 },
            }}
          />
        </Box>

        {/* Exercises Compact List (Top 3 items) */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, flex: 1, minHeight: 0, overflow: "hidden", justifyContent: "center" }}>
          {exercises.slice(0, 3).map((ex, idx) => (
            <Box
              key={idx}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                bgcolor: ex.done ? "#F0FDF4" : "#F8FAFC",
                border: ex.done ? "1px solid #DCFCE7" : "1px solid #EDF2F7",
                py: 0.4,
                px: 0.8,
                borderRadius: 1.5,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, minWidth: 0 }}>
                {ex.done ? (
                  <CheckCircleIcon sx={{ fontSize: 14, color: "#10B981", flexShrink: 0 }} />
                ) : (
                  <RadioButtonUncheckedIcon sx={{ fontSize: 14, color: "#94A3B8", flexShrink: 0 }} />
                )}
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: ex.done ? 700 : 500,
                    color: ex.done ? "#15803D" : "#1E293B",
                    fontSize: "0.72rem",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  <span style={{ fontWeight: 700, color: "#64748B", marginRight: 4 }}>{ex.type}:</span>
                  {ex.title}
                </Typography>
              </Box>

              <Typography variant="caption" sx={{ fontSize: "0.62rem", color: "#64748B", fontWeight: 600, flexShrink: 0, ml: 1 }}>
                {ex.duration}p
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Action Button: Jump to Schedule */}
        <Button
          variant="contained"
          color="primary"
          size="small"
          fullWidth
          onClick={() => navigate("/schedule")}
          endIcon={<PlayArrowIcon sx={{ fontSize: "1rem" }} />}
          sx={{
            py: 0.6,
            fontSize: "0.78rem",
            fontWeight: 800,
            borderRadius: 2,
            boxShadow: "0 2px 6px rgba(22, 163, 74, 0.25)",
            flexShrink: 0,
            mt: 0.5,
          }}
        >
          Vào phòng tập video ngay
        </Button>
      </CardContent>
    </Card>
  );
}
