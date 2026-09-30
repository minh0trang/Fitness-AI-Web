import React from "react";
import { Box, Card, CardContent, Typography, Chip } from "@mui/material";

export default function BmiGaugeWidget({
  height = 162,
  weight = 53,
}) {
  // BMI = weight(kg) / (height(m))^2
  const heightM = height / 100;
  const bmiVal = +(weight / (heightM * heightM)).toFixed(1);

  // BMI Category & Color
  let category = "Bình thường";
  let color = "#10B981";
  let bgChip = "#DCFCE7";
  let textChip = "#15803D";

  if (bmiVal < 18.5) {
    category = "Gầy";
    color = "#06B6D4";
    bgChip = "#CFFAFE";
    textChip = "#0891B2";
  } else if (bmiVal <= 24.9) {
    category = "Chuẩn Khoa Học";
    color = "#10B981";
    bgChip = "#DCFCE7";
    textChip = "#15803D";
  } else if (bmiVal <= 29.9) {
    category = "Thừa cân nhẹ";
    color = "#F59E0B";
    bgChip = "#FEF3C7";
    textChip = "#D97706";
  } else {
    category = "Béo phì";
    color = "#EF4444";
    bgChip = "#FEE2E2";
    textChip = "#DC2626";
  }

  // Map BMI (min 15 to max 35) to angle from -90deg (left) to 90deg (right)
  const clampedBmi = Math.max(15, Math.min(35, bmiVal));
  const angle = ((clampedBmi - 15) / 20) * 180 - 90; // -90 deg to 90 deg

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
      <CardContent sx={{ p: 1.4, "&:last-child": { pb: 1.4 }, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0 }}>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748B", textTransform: "uppercase", fontSize: "0.65rem", letterSpacing: "0.03em" }}>
              Chỉ Số Thể Trạng BMI
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 850, color: "#0F172A", lineHeight: 1.1, fontSize: "1.15rem", mt: 0.2 }}>
              {bmiVal} <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748B" }}>BMI</span>
            </Typography>
          </Box>

          <Chip
            label={category}
            size="small"
            sx={{
              height: 22,
              fontSize: "0.68rem",
              fontWeight: 700,
              bgcolor: bgChip,
              color: textChip,
            }}
          />
        </Box>

        {/* Gauge Center Graphic */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, minHeight: 0, my: 0.5 }}>
          <Box sx={{ position: "relative", width: 170, height: 90, overflow: "hidden" }}>
            <svg viewBox="0 0 140 75" width="170" height="90">
              {/* Background Arc Bands: Underweight (<18.5), Normal (18.5-24.9), Overweight (25-29.9), Obese (>=30) */}
              {/* Segment 1: Cyan (15 - 18.5) -> 0 to 31.5 deg */}
              <path
                d="M 15 70 A 55 55 0 0 1 28 32"
                fill="none"
                stroke="#06B6D4"
                strokeWidth="10"
                strokeLinecap="round"
              />
              {/* Segment 2: Emerald (18.5 - 24.9) -> 31.5 to 89 deg */}
              <path
                d="M 32 28 A 55 55 0 0 1 85 20"
                fill="none"
                stroke="#10B981"
                strokeWidth="10"
              />
              {/* Segment 3: Amber (25 - 29.9) -> 90 to 135 deg */}
              <path
                d="M 89 21 A 55 55 0 0 1 116 35"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="10"
              />
              {/* Segment 4: Rose (>=30) -> 135 to 180 deg */}
              <path
                d="M 119 39 A 55 55 0 0 1 125 70"
                fill="none"
                stroke="#EF4444"
                strokeWidth="10"
                strokeLinecap="round"
              />

              {/* Gauge Needle */}
              <g transform={`rotate(${angle} 70 70)`} style={{ transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)" }}>
                <line x1="70" y1="70" x2="70" y2="24" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
                <polygon points="67,28 73,28 70,18" fill="#1E293B" />
              </g>

              {/* Pivot Circle */}
              <circle cx="70" cy="70" r="6" fill="#0F172A" />
              <circle cx="70" cy="70" r="2.5" fill="#FFFFFF" />
            </svg>
          </Box>

          {/* Scale Labels */}
          <Box sx={{ display: "flex", justifyContent: "space-between", width: 170, px: 0.5, mt: -0.2 }}>
            <Typography variant="caption" sx={{ fontSize: "0.58rem", color: "#64748B", fontWeight: 600 }}>15</Typography>
            <Typography variant="caption" sx={{ fontSize: "0.58rem", color: "#10B981", fontWeight: 700 }}>18.5 - 24.9 (Chuẩn)</Typography>
            <Typography variant="caption" sx={{ fontSize: "0.58rem", color: "#64748B", fontWeight: 600 }}>35</Typography>
          </Box>
        </Box>

        {/* Footer Metrics */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "#F8FAFC", p: 0.8, borderRadius: 2, border: "1px solid #EDF2F7", flexShrink: 0 }}>
          <Typography variant="caption" sx={{ color: "#64748B", fontSize: "0.68rem" }}>
            Chiều cao: <strong>{height} cm</strong>
          </Typography>
          <Typography variant="caption" sx={{ color: "#64748B", fontSize: "0.68rem" }}>
            Cân nặng: <strong>{weight} kg</strong>
          </Typography>
          <Typography variant="caption" sx={{ color: color, fontSize: "0.68rem", fontWeight: 700 }}>
            {bmiVal <= 24.9 ? "Thể trạng chuẩn 🌟" : "Mục tiêu: 22.5 BMI 🎯"}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
