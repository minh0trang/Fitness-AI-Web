import React from "react";
import { Box, Card, CardContent, Typography, Chip } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

export default function WorkoutDonutWidget({
  completed = 3,
  total = 5,
}) {
  const percent = Math.min(100, Math.round((completed / total) * 100));
  const remaining = Math.max(0, total - completed);

  // SVG Donut params
  const radius = 38;
  const strokeWidth = 9;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: "1px solid #E2E8F0",
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
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748B", textTransform: "uppercase", fontSize: "0.62rem" }}>
              Hoàn Thành Lộ Trình
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#0F172A", lineHeight: 1.1, fontSize: "1.05rem" }}>
              {completed} / {total} <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#64748B" }}>buổi tập</span>
            </Typography>
          </Box>

          <Chip
            label={percent >= 60 ? "Đúng tiến độ 🔥" : "Cần tăng tốc"}
            size="small"
            sx={{
              height: 20,
              fontSize: "0.65rem",
              fontWeight: 700,
              bgcolor: percent >= 60 ? "#ECFDF5" : "#FEF3C7",
              color: percent >= 60 ? "#059669" : "#D97706",
            }}
          />
        </Box>

        {/* Donut and Legend Body */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-around", flex: 1, minHeight: 0 }}>
          {/* SVG Donut */}
          <Box sx={{ position: "relative", width: 95, height: 95, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="95" height="95" viewBox="0 0 95 95" style={{ transform: "rotate(-90deg)" }}>
              {/* Background circle */}
              <circle
                cx="47.5"
                cy="47.5"
                r={radius}
                fill="none"
                stroke="#F1F5F9"
                strokeWidth={strokeWidth}
              />
              {/* Completed progress arc */}
              <circle
                cx="47.5"
                cy="47.5"
                r={radius}
                fill="none"
                stroke="url(#donutGrad)"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.5s ease" }}
              />
              <defs>
                <linearGradient id="donutGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#34D399" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center Text */}
            <Box sx={{ position: "absolute", textAlign: "center" }}>
              <Typography variant="body1" sx={{ fontWeight: 800, color: "#0F172A", lineHeight: 1, fontSize: "1.1rem" }}>
                {percent}%
              </Typography>
              <Typography variant="caption" sx={{ fontSize: "0.62rem", color: "#64748B", fontWeight: 600 }}>
                {completed}/{total}
              </Typography>
            </Box>
          </Box>

          {/* Legend Details */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8, minWidth: 130 }}>
            {/* Completed */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, bgcolor: "#F0FDF4", p: 0.6, borderRadius: 1.5 }}>
              <CheckCircleIcon sx={{ fontSize: 16, color: "#10B981" }} />
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "#059669", fontSize: "0.7rem", display: "block", lineHeight: 1.1 }}>
                  Đã tập: {completed} buổi ({percent}%)
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748B", fontSize: "0.6rem" }}>
                  Đạt chuẩn cam kết
                </Typography>
              </Box>
            </Box>

            {/* Remaining */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, bgcolor: "#F8FAFC", p: 0.6, borderRadius: 1.5, border: "1px dashed #E2E8F0" }}>
              <RadioButtonUncheckedIcon sx={{ fontSize: 16, color: "#94A3B8" }} />
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569", fontSize: "0.7rem", display: "block", lineHeight: 1.1 }}>
                  Còn lại: {remaining} buổi ({100 - percent}%)
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748B", fontSize: "0.6rem" }}>
                  Thứ 6 & Thứ 7 tới
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
