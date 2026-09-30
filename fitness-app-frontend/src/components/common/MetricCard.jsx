import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";

const COLOR_MAP = {
  emerald: {
    bg: "rgba(16, 185, 129, 0.08)",
    border: "rgba(16, 185, 129, 0.2)",
    iconBg: "#DCFCE7",
    iconColor: "#15803D",
    valueColor: "#1F2937",
    trendColor: "#15803D",
  },
  sky: {
    bg: "rgba(2, 132, 199, 0.08)",
    border: "rgba(2, 132, 199, 0.2)",
    iconBg: "#E0F2FE",
    iconColor: "#0284C7",
    valueColor: "#1F2937",
    trendColor: "#0284C7",
  },
  amber: {
    bg: "rgba(217, 119, 6, 0.08)",
    border: "rgba(217, 119, 6, 0.2)",
    iconBg: "#FEF3C7",
    iconColor: "#D97706",
    valueColor: "#1F2937",
    trendColor: "#D97706",
  },
  rose: {
    bg: "rgba(239, 68, 68, 0.08)",
    border: "rgba(239, 68, 68, 0.2)",
    iconBg: "#FEE2E2",
    iconColor: "#DC2626",
    valueColor: "#1F2937",
    trendColor: "#DC2626",
  },
  gray: {
    bg: "#F8FAFC",
    border: "#E2E8F0",
    iconBg: "#F1F5F9",
    iconColor: "#64748B",
    valueColor: "#1F2937",
    trendColor: "#64748B",
  },
};

export default function MetricCard({
  title,
  value,
  unit,
  subtitle,
  icon,
  colorScheme = "emerald",
}) {
  const colors = COLOR_MAP[colorScheme] || COLOR_MAP.emerald;

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 3.5,
        border: `1px solid ${colors.border}`,
        bgcolor: "#FFFFFF",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.06)",
        },
      }}
    >
      <CardContent sx={{ p: 1.2, "&:last-child": { pb: 1.2 } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.4 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: "#64748B",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              fontSize: "0.65rem",
            }}
          >
            {title}
          </Typography>

          <Box
            sx={{
              p: 0.6,
              borderRadius: "8px",
              bgcolor: colors.iconBg,
              color: colors.iconColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              "& svg": { fontSize: 16 },
            }}
          >
            {icon}
          </Box>
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 800, color: colors.valueColor, lineHeight: 1.1, mb: 0.2, fontSize: "1.2rem" }}>
          {value}{" "}
          {unit && (
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#64748B" }}>
              {unit}
            </span>
          )}
        </Typography>

        {subtitle && (
          <Typography variant="caption" sx={{ color: colors.trendColor, fontWeight: 600, fontSize: "0.68rem" }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
