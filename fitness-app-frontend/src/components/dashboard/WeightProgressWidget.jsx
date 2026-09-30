import React, { useState } from "react";
import { Box, Card, CardContent, Typography, Tooltip, Chip } from "@mui/material";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import FlagIcon from "@mui/icons-material/Flag";

export default function WeightProgressWidget({
  data = {
    startWeight: 72.0,
    currentWeight: 70.5,
    goalWeight: 68.0,
    unit: "kg",
    history: [
      { date: "01/9", weight: 72.0 },
      { date: "08/9", weight: 71.6 },
      { date: "15/9", weight: 71.2 },
      { date: "22/9", weight: 70.8 },
      { date: "29/9", weight: 70.5, isNow: true },
    ],
  },
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const { startWeight, currentWeight, goalWeight, history } = data;
  const totalToLose = Math.max(0.1, startWeight - goalWeight);
  const lostSoFar = Math.max(0, startWeight - currentWeight);
  const goalPercent = Math.min(100, Math.round((lostSoFar / totalToLose) * 100));
  const remaining = Math.max(0, +(currentWeight - goalWeight).toFixed(1));

  // Compute SVG Line coordinates
  const minW = Math.min(...history.map((h) => h.weight), goalWeight) - 0.5;
  const maxW = Math.max(...history.map((h) => h.weight)) + 0.5;
  const rangeW = maxW - minW || 1;

  const svgWidth = 320;
  const svgHeight = 70;
  const paddingX = 25;
  const paddingY = 12;

  const points = history.map((item, idx) => {
    const x = paddingX + (idx / (history.length - 1)) * (svgWidth - paddingX * 2);
    const y = svgHeight - paddingY - ((item.weight - minW) / rangeW) * (svgHeight - paddingY * 2);
    return { ...item, x, y };
  });

  const pathD = points.reduce(
    (acc, pt, i) => (i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`),
    ""
  );

  const areaD = `${pathD} L ${points[points.length - 1].x},${svgHeight} L ${points[0].x},${svgHeight} Z`;

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
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748B", textTransform: "uppercase", fontSize: "0.62rem" }}>
              Tiến Độ Cân Nặng
            </Typography>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.8 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#0F172A", lineHeight: 1.1, fontSize: "1.1rem" }}>
                {currentWeight} <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748B" }}>kg</span>
              </Typography>
              <Chip
                icon={<TrendingDownIcon sx={{ fontSize: "0.8rem !important", color: "#16A34A !important" }} />}
                label={`-${lostSoFar.toFixed(1)} kg`}
                size="small"
                sx={{ height: 18, fontSize: "0.62rem", fontWeight: 700, bgcolor: "#DCFCE7", color: "#15803D" }}
              />
            </Box>
          </Box>

          <Box sx={{ textAlign: "right" }}>
            <Typography variant="caption" sx={{ color: "#64748B", fontSize: "0.62rem", display: "block" }}>
              Mục tiêu: <strong>{goalWeight} kg</strong>
            </Typography>
            <Typography variant="caption" sx={{ color: "#D97706", fontWeight: 700, fontSize: "0.65rem" }}>
              Còn {remaining} kg nữa
            </Typography>
          </Box>
        </Box>

        {/* Goal Progress Bar: 72kg ─────●── 70.5kg ──── 68kg */}
        <Box sx={{ bgcolor: "#F8FAFC", p: 0.7, borderRadius: 2, border: "1px solid #EDF2F7", flexShrink: 0, my: 0.2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: "0.62rem", fontWeight: 700, color: "#64748B", mb: 0.3 }}>
            <span>Start: {startWeight}kg</span>
            <span style={{ color: "#10B981" }}>Now: {currentWeight}kg ({goalPercent}%)</span>
            <span style={{ color: "#0284C7" }}>Goal: {goalWeight}kg</span>
          </Box>

          <Box sx={{ position: "relative", width: "100%", height: 6, bgcolor: "#E2E8F0", borderRadius: 3 }}>
            <Box
              sx={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: `${goalPercent}%`,
                bgcolor: "#10B981",
                borderRadius: 3,
                transition: "width 0.3s ease",
              }}
            />
            {/* Glowing Dot representing Now */}
            <Box
              sx={{
                position: "absolute",
                left: `calc(${goalPercent}% - 5px)`,
                top: -2,
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: "#10B981",
                border: "2px solid #FFFFFF",
                boxShadow: "0 0 6px rgba(16, 185, 129, 0.7)",
              }}
            />
          </Box>
        </Box>

        {/* Line Chart Area */}
        <Box sx={{ position: "relative", flex: 1, minHeight: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: "100%", height: "100%", overflow: "visible" }}>
            <defs>
              <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0284C7" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#0284C7" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Gradient Area under line */}
            <path d={areaD} fill="url(#weightGrad)" />

            {/* Main Trend Line */}
            <path d={pathD} fill="none" stroke="#0284C7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

            {/* Data Points */}
            {points.map((pt, idx) => {
              const isHovered = hoveredIdx === idx;
              const isNow = pt.isNow;
              return (
                <g key={idx}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 5 : isNow ? 4.5 : 3.5}
                    fill={isNow ? "#10B981" : "#FFFFFF"}
                    stroke={isNow ? "#059669" : "#0284C7"}
                    strokeWidth={isNow ? "2" : "1.8"}
                    style={{ cursor: "pointer", transition: "all 0.15s ease" }}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  />
                  {/* Calorie text label on top of point */}
                  <text
                    x={pt.x}
                    y={pt.y - 7}
                    textAnchor="middle"
                    fill={isNow ? "#059669" : "#475569"}
                    fontSize={isHovered ? "8.5" : "7.5"}
                    fontWeight={isNow ? "800" : "600"}
                  >
                    {pt.weight}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* X-axis date labels */}
          <Box sx={{ display: "flex", justifyContent: "space-between", px: 2, mt: 0.2 }}>
            {history.map((h, i) => (
              <Typography
                key={i}
                variant="caption"
                sx={{
                  fontSize: "0.6rem",
                  fontWeight: h.isNow ? 800 : 500,
                  color: h.isNow ? "#059669" : "#94A3B8",
                }}
              >
                {h.date}
              </Typography>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
