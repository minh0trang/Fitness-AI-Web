import React, { useState } from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Tooltip,
  Chip,
} from "@mui/material";

export default function WeeklyCalorieChart({ chartData }) {
  const [hoveredDay, setHoveredDay] = useState(null);

  // In 2x2 grid cell, show the 7 days of the current week for maximum clarity
  const displayData = chartData && chartData.length > 7 ? chartData.slice(-7) : chartData;

  const maxCalories = 500;
  const yAxisTicks = [500, 375, 250, 125, 0];

  return (
    <Card
      sx={{
        borderRadius: "16px",
        border: "1px solid #E5E7EB",
        bgcolor: "#FFFFFF",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
        overflow: "hidden",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent sx={{ p: 1.6, "&:last-child": { pb: 1.6 }, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1, flexShrink: 0, flexWrap: "wrap", gap: 1 }}>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748B", textTransform: "uppercase", fontSize: "0.68rem", letterSpacing: "0.03em" }}>
              Biểu Đồ Tiêu Hao Năng Lượng
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 850, color: "#0F172A", lineHeight: 1.2, fontSize: "1.3rem", mt: 0.2 }}>
              465 <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#64748B" }}>kcal hôm nay (T3)</span>
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Chip
              label="Trung bình: 385 kcal"
              size="small"
              sx={{ fontWeight: 700, fontSize: "0.68rem", bgcolor: "#ECFDF5", color: "#059669", height: 24 }}
            />
            <Chip
              label="Mục tiêu: 250 kcal/ngày"
              size="small"
              sx={{ fontWeight: 700, fontSize: "0.68rem", bgcolor: "#FEF3C7", color: "#D97706", height: 24 }}
            />
          </Box>
        </Box>

        <Box sx={{ width: "100%", position: "relative", flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
          {/* Chart Plot Area with Grid Lines */}
          <Box
            sx={{
              position: "relative",
              flex: 1,
              minHeight: 0,
              width: "100%",
              pl: 4, // Space for Y-axis numbers
              display: "flex",
              alignItems: "flex-end",
              borderBottom: "1.5px solid #E2E8F0",
            }}
          >
            {/* Horizontal Grid lines & Y-axis labels */}
            {yAxisTicks.map((tickVal) => {
              const tickPercent = Math.round((tickVal / maxCalories) * 100);
              return (
                <Box
                  key={tickVal}
                  sx={{
                    position: "absolute",
                    bottom: `${tickPercent}%`,
                    left: 0,
                    right: 0,
                    borderBottom: tickVal === 0 ? "none" : "1px dashed #E2E8F0",
                    pointerEvents: "none",
                    zIndex: 0,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      position: "absolute",
                      left: 0,
                      bottom: -8,
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      color: "#94A3B8",
                    }}
                  >
                    {tickVal}
                  </Typography>
                </Box>
              );
            })}

            {/* Target 250 kcal dashed indicator */}
            <Box
              sx={{
                position: "absolute",
                bottom: `${Math.round((250 / maxCalories) * 100)}%`,
                left: 45,
                right: 0,
                borderBottom: "1.5px dashed #F59E0B",
                zIndex: 1,
                pointerEvents: "none",
              }}
            >
            </Box>

            {/* Full Bars Container across 100% width */}
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                width: "100%",
                height: "100%",
                zIndex: 2,
                px: 1,
              }}
            >
              {displayData.map((item, idx) => {
                const barHeightPercent =
                  item.calories > 0
                    ? Math.max(10, Math.min(100, Math.round((item.calories / maxCalories) * 100)))
                    : 3;
                const isHovered = hoveredDay === idx;
                const isToday = item.isToday;

                return (
                  <Tooltip
                    key={idx}
                    title={`${item.day} (${item.date}): ${item.calories} kcal (${item.minutes} phút)`}
                    arrow
                    placement="top"
                  >
                    <Box
                      onMouseEnter={() => setHoveredDay(idx)}
                      onMouseLeave={() => setHoveredDay(null)}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        height: "100%",
                        justifyContent: "flex-end",
                        width: `${100 / displayData.length}%`,
                        cursor: "pointer",
                        px: 0.5,
                      }}
                    >
                      {/* Calorie text label on top of bar */}
                      {item.calories > 0 && (
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: "0.82rem",
                            fontWeight: 850,
                            color: isToday ? "#059669" : "#334155",
                            mb: 0.4,
                            transition: "transform 0.15s ease",
                            transform: isHovered ? "scale(1.15)" : "scale(1)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.calories}
                        </Typography>
                      )}

                      {/* Wide, Solid, Impressive Bar */}
                      <Box
                        sx={{
                          width: "75%",
                          maxWidth: 54,
                          minWidth: 18,
                          height: `${barHeightPercent}%`,
                          borderRadius: "10px 10px 4px 4px",
                          background: isToday
                            ? "linear-gradient(180deg, #10B981 0%, #059669 100%)"
                            : item.calories > 0
                              ? isHovered
                                ? "linear-gradient(180deg, #34D399 0%, #10B981 100%)"
                                : "linear-gradient(180deg, #6EE7B7 0%, #10B981 100%)"
                              : "#F1F5F9",
                          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                          boxShadow:
                            isToday || isHovered
                              ? "0 8px 20px rgba(16, 185, 129, 0.35)"
                              : "none",
                          transform: isHovered ? "scaleY(1.02)" : "none",
                        }}
                      />
                    </Box>
                  </Tooltip>
                );
              })}
            </Box>
          </Box>

          {/* Day & Date Labels along X-Axis */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              pl: 4.5,
              mt: 0.8,
              px: 1,
              flexShrink: 0,
            }}
          >
            {displayData.map((item, idx) => {
              const isToday = item.isToday;
              return (
                <Box key={idx} sx={{ width: `${100 / displayData.length}%`, textAlign: "center" }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: isToday ? 800 : 700,
                      color: isToday ? "#059669" : "#334155",
                      fontSize: "0.75rem",
                      display: "block",
                      lineHeight: 1.1,
                    }}
                  >
                    {item.day}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: "0.64rem",
                      color: isToday ? "#059669" : "#94A3B8",
                      fontWeight: isToday ? 700 : 500,
                      display: "block",
                      lineHeight: 1.1,
                    }}
                  >
                    {item.date}
                  </Typography>

                  {isToday && (
                    <Box
                      sx={{
                        width: 4,
                        height: 4,
                        borderRadius: "50%",
                        bgcolor: "#10B981",
                        mx: "auto",
                        mt: 0.1,
                      }}
                    />
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
