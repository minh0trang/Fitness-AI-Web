import React from "react";
import { Box, Card, CardContent, Typography, LinearProgress, Chip } from "@mui/material";
import StraightenIcon from "@mui/icons-material/Straighten";
import AccessibilityNewIcon from "@mui/icons-material/AccessibilityNew";
import FlagIcon from "@mui/icons-material/Flag";

export default function BodyMetricsWidget({
  height = 162,
  weight = 70.5,
  waist = 65,
  waistGoal = 62,
}) {
  // BMI calculation
  const heightM = height / 100;
  const bmiVal = +(weight / (heightM * heightM)).toFixed(1);

  let bmiLabel = "Cân đối";
  let bmiColor = "#10B981";
  let bmiBg = "#DCFCE7";

  if (bmiVal < 18.5) {
    bmiLabel = "Gầy";
    bmiColor = "#06B6D4";
    bmiBg = "#CFFAFE";
  } else if (bmiVal <= 24.9) {
    bmiLabel = "Cân đối";
    bmiColor = "#10B981";
    bmiBg = "#DCFCE7";
  } else if (bmiVal <= 29.9) {
    bmiLabel = "Thừa cân nhẹ";
    bmiColor = "#F59E0B";
    bmiBg = "#FEF3C7";
  } else {
    bmiLabel = "Béo phì";
    bmiColor = "#EF4444";
    bmiBg = "#FEE2E2";
  }

  // Waist progress calculation
  // Assume starting waist was around 68cm if waist is 65cm and goal is 62cm
  const startWaist = 68;
  const totalWaistToReduce = Math.max(0.1, startWaist - waistGoal); // 6cm
  const waistReduced = Math.max(0, startWaist - waist); // 3cm
  const waistProgressPercent = Math.min(100, Math.round((waistReduced / totalWaistToReduce) * 100));
  const remainingWaist = Math.max(0, waist - waistGoal);

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
      <CardContent
        sx={{
          p: 1.3,
          "&:last-child": { pb: 1.3 },
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
            <Box
              sx={{
                width: 26,
                height: 26,
                borderRadius: 1.5,
                bgcolor: "#DCFCE7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#16A34A",
              }}
            >
              <AccessibilityNewIcon sx={{ fontSize: "1rem" }} />
            </Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0F172A", fontSize: "0.85rem" }}>
              Chỉ Số Hình Thể
            </Typography>
          </Box>

          <Chip
            size="small"
            label={bmiLabel}
            sx={{
              bgcolor: bmiBg,
              color: bmiColor,
              fontWeight: 700,
              fontSize: "0.68rem",
              height: 20,
            }}
          />
        </Box>

        {/* 4 Compact Metric Blocks */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 0.8,
            my: 0.5,
          }}
        >
          {/* Block 1: BMI */}
          <Box
            sx={{
              p: 0.8,
              borderRadius: "12px",
              bgcolor: "#F8FAFC",
              border: "1px solid #F1F5F9",
              textAlign: "center",
            }}
          >
            <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700, fontSize: "0.65rem", display: "block" }}>
              BMI
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#0F172A", fontSize: "1rem", lineHeight: 1.2 }}>
              {bmiVal}
            </Typography>
            <Typography variant="caption" sx={{ color: "#10B981", fontWeight: 600, fontSize: "0.58rem" }}>
              Chuẩn WHO
            </Typography>
          </Box>

          {/* Block 2: Cân nặng */}
          <Box
            sx={{
              p: 0.8,
              borderRadius: "12px",
              bgcolor: "#F8FAFC",
              border: "1px solid #F1F5F9",
              textAlign: "center",
            }}
          >
            <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700, fontSize: "0.65rem", display: "block" }}>
              Cân Nặng
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#0F172A", fontSize: "1rem", lineHeight: 1.2 }}>
              {weight} <span style={{ fontSize: "0.62rem", fontWeight: 600, color: "#94A3B8" }}>kg</span>
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600, fontSize: "0.58rem" }}>
              Đang siết mỡ
            </Typography>
          </Box>

          {/* Block 3: Chiều cao */}
          <Box
            sx={{
              p: 0.8,
              borderRadius: "12px",
              bgcolor: "#F8FAFC",
              border: "1px solid #F1F5F9",
              textAlign: "center",
            }}
          >
            <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700, fontSize: "0.65rem", display: "block" }}>
              Chiều Cao
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#0F172A", fontSize: "1rem", lineHeight: 1.2 }}>
              {height} <span style={{ fontSize: "0.62rem", fontWeight: 600, color: "#94A3B8" }}>cm</span>
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600, fontSize: "0.58rem" }}>
              Cố định
            </Typography>
          </Box>

          {/* Block 4: Vòng 2 */}
          <Box
            sx={{
              p: 0.8,
              borderRadius: "12px",
              bgcolor: "#F8FAFC",
              border: "1px solid #F1F5F9",
              textAlign: "center",
            }}
          >
            <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700, fontSize: "0.65rem", display: "block" }}>
              Vòng Eo
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#16A34A", fontSize: "1rem", lineHeight: 1.2 }}>
              {waist} <span style={{ fontSize: "0.62rem", fontWeight: 600, color: "#94A3B8" }}>cm</span>
            </Typography>
            <Typography variant="caption" sx={{ color: "#16A34A", fontWeight: 600, fontSize: "0.58rem" }}>
              Mục tiêu: {waistGoal}cm
            </Typography>
          </Box>
        </Box>

        {/* Waist Goal Progress Bar */}
        <Box
          sx={{
            p: 1,
            borderRadius: "12px",
            bgcolor: "#F0FDF4",
            border: "1px solid #DCFCE7",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.6 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <FlagIcon sx={{ fontSize: "0.8rem", color: "#16A34A" }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#166534", fontSize: "0.68rem" }}>
                Mục Tiêu Vòng Eo: Giảm còn {waistGoal} cm
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ fontWeight: 800, color: "#16A34A", fontSize: "0.7rem" }}>
              {waistProgressPercent}% (còn {remainingWaist} cm)
            </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={waistProgressPercent}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: "#DCFCE7",
              "& .MuiLinearProgress-bar": {
                bgcolor: "#16A34A",
                borderRadius: 3,
              },
            }}
          />

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.4 }}>
            <Typography variant="caption" sx={{ fontSize: "0.6rem", color: "#64748B", fontWeight: 600 }}>
              Bắt đầu: {startWaist} cm
            </Typography>
            <Typography variant="caption" sx={{ fontSize: "0.6rem", color: "#16A34A", fontWeight: 700 }}>
              Hiện tại: {waist} cm
            </Typography>
            <Typography variant="caption" sx={{ fontSize: "0.6rem", color: "#15803D", fontWeight: 800 }}>
              Đích đến: {waistGoal} cm
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
