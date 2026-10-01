import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LockIcon from "@mui/icons-material/Lock";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import TimerIcon from "@mui/icons-material/Timer";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import BoltIcon from "@mui/icons-material/Bolt";
import FavoriteIcon from "@mui/icons-material/Favorite";
import HealingIcon from "@mui/icons-material/Healing";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import SelfImprovementIcon from "@mui/icons-material/SelfImprovement";
import {
  MONTHLY_CALENDAR_DATA,
  DIFFICULTY_OPTIONS,
  ENERGY_OPTIONS,
  PAIN_AREAS,
} from "../data/mockWorkouts";

const DAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

const MONTH_NAMES = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
];

// Bản đồ màu sắc độ đậm nhạt theo mức thể trạng / sức khỏe sau tập (Energy 1-5)
export const ENERGY_CELL_STYLES = {
  1: {
    // 1 - Kiệt sức: Xanh lá rất nhạt
    cellBg: "#F0FDF4",
    cellBorder: "1.5px solid #BBF7D0",
    textColor: "#166534",
    label: "Kiệt sức",
    tag: "1/5",
  },
  2: {
    // 2 - Khá mệt: Xanh lá nhạt
    cellBg: "#DCFCE7",
    cellBorder: "1.5px solid #86EFAC",
    textColor: "#15803D",
    label: "Khá mệt",
    tag: "2/5",
  },
  3: {
    // 3 - Bình thường: Xanh lá vừa
    cellBg: "#A7F3D0",
    cellBorder: "1.5px solid #6EE7B7",
    textColor: "#065F46",
    label: "Vừa sức",
    tag: "3/5",
  },
  4: {
    // 4 - Dồi dào: Xanh lá đậm
    cellBg: "#34D399",
    cellBorder: "1.5px solid #10B981",
    textColor: "#064E3B",
    label: "Dồi dào",
    tag: "4/5",
  },
  5: {
    // 5 - Bùng nổ: Xanh emerald đậm nhất, rực rỡ
    cellBg: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    cellBorder: "1.5px solid #047857",
    textColor: "#FFFFFF",
    label: "Bùng nổ",
    tag: "5/5",
    shadow: "0 3px 8px rgba(5, 150, 105, 0.28)",
  },
};

export default function ProgressPage({ journalEntries }) {
  const navigate = useNavigate();
  // Calendar month navigation state (Default: September 2026, monthIndex = 8)
  const [currentMonthIndex, setCurrentMonthIndex] = useState(8);
  const currentYear = 2026;
  const [selectedDay, setSelectedDay] = useState(null);

  const handlePrevMonth = () => {
    setCurrentMonthIndex((prev) => (prev > 0 ? prev - 1 : 11));
  };

  const handleNextMonth = () => {
    setCurrentMonthIndex((prev) => (prev < 11 ? prev + 1 : 0));
  };

  // Calendar math:
  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  const firstDayJs = new Date(currentYear, currentMonthIndex, 1).getDay();
  const startPaddingDays = (firstDayJs + 6) % 7;

  // Month data
  const isSeptember = currentMonthIndex === 8;
  const isFutureMonth = currentMonthIndex > 8;

  const daysList = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1;
    if (isFutureMonth) {
      return {
        dayNumber: dayNum,
        status: "locked",
        title: "Lộ trình tuần mới đang khóa",
      };
    }
    if (isSeptember) {
      let baseDay = MONTHLY_CALENDAR_DATA.find((d) => d.dayNumber === dayNum) || {
        dayNumber: dayNum,
        status: "locked",
        title: "Lộ trình đang tạm khóa",
      };

      // Đồng bộ thời gian thực với nhật ký vừa được submit (journalEntries từ props)
      const matchingJournal = journalEntries?.find((j) => {
        if (!j.date) return false;
        const parts = j.date.split("/");
        return (
          parseInt(parts[0], 10) === dayNum &&
          parseInt(parts[1], 10) === currentMonthIndex + 1
        );
      });

      if (matchingJournal) {
        baseDay = {
          ...baseDay,
          status: "completed",
          title: matchingJournal.workoutTitle || baseDay.title,
          calories: matchingJournal.caloriesBurned || baseDay.calories,
          durationMinutes: matchingJournal.durationMinutes || baseDay.durationMinutes,
          difficulty: matchingJournal.difficulty || matchingJournal.rating || 3,
          energy: matchingJournal.energy || 4,
          hasPain: matchingJournal.hasPain || false,
          painLocations: matchingJournal.painLocations || [],
          note: matchingJournal.notes || baseDay.note,
          photo: matchingJournal.checkInPhoto || baseDay.photo,
          encouragement: matchingJournal.encouragement || baseDay.encouragement,
        };
      }

      return baseDay;
    }

    // Các tháng trước đó: dữ liệu mẫu thực tế
    const sampleStatuses = ["completed", "completed", "rest", "completed", "missed", "completed", "rest"];
    const status = sampleStatuses[(dayNum + currentMonthIndex) % 7];
    const energy = ((dayNum + currentMonthIndex) % 5) + 1;
    return {
      dayNumber: dayNum,
      status: status,
      calories: status === "completed" ? 380 : 0,
      durationMinutes: status === "completed" ? 38 : 0,
      energy: status === "completed" ? energy : null,
      difficulty: status === "completed" ? 3 : null,
      hasPain: false,
      painLocations: [],
      title: status === "completed" ? "Buổi tập chuyên cần" : status === "rest" ? "Nghỉ ngơi phục hồi" : "Bỏ lỡ buổi tập",
      encouragement: "Kỷ luật hôm nay tạo nên sự tự tin ngày mai! ✨",
    };
  });

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Main Monthly Calendar Card */}
      <Card sx={{ borderRadius: 3.5, border: "1px solid #E2E8F0", bgcolor: "#FFFFFF", p: { xs: 2, sm: 3.5 } }}>
        {/* Calendar Navigation Bar & Legend */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5, flexWrap: "wrap", gap: 2 }}>
          {/* Month Selector with Prev/Next buttons */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton size="small" onClick={handlePrevMonth} sx={{ border: "1px solid #E2E8F0", borderRadius: 2 }}>
              <ChevronLeftIcon />
            </IconButton>

            <Typography variant="h5" sx={{ fontWeight: 800, color: "#0F172A", minWidth: 160, textAlign: "center" }}>
              {MONTH_NAMES[currentMonthIndex]} • {currentYear}
            </Typography>

            <IconButton size="small" onClick={handleNextMonth} sx={{ border: "1px solid #E2E8F0", borderRadius: 2 }}>
              <ChevronRightIcon />
            </IconButton>
          </Box>

          {/* Color Legend & Health Intensity Spectrum */}
          <Box sx={{ display: "flex", gap: { xs: 1.5, sm: 2.5 }, flexWrap: "wrap", alignItems: "center" }}>
            {/* Health/Energy level gradient indicator */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#334155", fontSize: "0.72rem" }}>
                Sức khỏe sau tập:
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                {[1, 2, 3, 4, 5].map((lvl) => {
                  const style = ENERGY_CELL_STYLES[lvl];
                  return (
                    <Box
                      key={lvl}
                      title={`Mức ${lvl}: ${style.label}`}
                      sx={{
                        width: 14,
                        height: 14,
                        borderRadius: "3px",
                        background: style.cellBg,
                        border: style.cellBorder,
                      }}
                    />
                  );
                })}
              </Box>
              <Typography variant="caption" sx={{ fontSize: "0.68rem", color: "#64748B", fontWeight: 600 }}>
                (1: Kiệt sức ➔ 5: Bùng nổ)
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: "3px", bgcolor: "#EF4444" }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: "#475569" }}>Bỏ lỡ</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: "3px", bgcolor: "#E2E8F0" }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: "#475569" }}>Ngày nghỉ</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: "3px", border: "2px solid #0284C7", bgcolor: "#E0F2FE" }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: "#475569" }}>Hôm nay</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
              <LockIcon sx={{ fontSize: 13, color: "#94A3B8" }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: "#475569" }}>Khóa chờ check-in</Typography>
            </Box>
          </Box>
        </Box>

        {/* 7 Columns Day Headers (T2 -> CN) */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 1.2,
            mb: 1.5,
            textAlign: "center",
          }}
        >
          {DAY_LABELS.map((dayLabel, idx) => (
            <Typography
              key={idx}
              variant="subtitle2"
              sx={{
                fontWeight: 800,
                color: idx >= 5 ? "#EF4444" : "#64748B",
                fontSize: "0.85rem",
              }}
            >
              {dayLabel}
            </Typography>
          ))}
        </Box>

        {/* Calendar Grid: Perfectly Equal Sized Cells */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 1.2,
            width: "100%",
          }}
        >
          {/* 1. Leading Padding Cells from Previous Month */}
          {Array.from({ length: startPaddingDays }).map((_, idx) => (
            <Box
              key={`pad-${idx}`}
              sx={{
                minHeight: 82,
                borderRadius: 2.5,
                bgcolor: "#F8FAFC",
                border: "1px dashed #E2E8F0",
                opacity: 0.4,
              }}
            />
          ))}

          {/* 2. Days of Current Month with Health/Energy Color Shade */}
          {daysList.map((day) => {
            const isCompleted = day.status === "completed";
            const isMissed = day.status === "missed";
            const isRest = day.status === "rest";
            const isToday = day.isToday;
            const isLocked = day.status === "locked" || day.status === "future";

            const energyLvl = day.energy || 4;
            const energyStyle = ENERGY_CELL_STYLES[energyLvl] || ENERGY_CELL_STYLES[4];

            let cellBg = "#F8FAFC";
            let cellBorder = "1px solid #E2E8F0";
            let textColor = "#0F172A";

            if (isLocked) {
              cellBg = "#F8FAFC";
              cellBorder = "1px dashed #CBD5E1";
              textColor = "#94A3B8";
            } else if (isCompleted) {
              cellBg = energyStyle.cellBg;
              cellBorder = energyStyle.cellBorder;
              textColor = energyStyle.textColor;
            } else if (isMissed) {
              cellBg = "rgba(239, 68, 68, 0.1)";
              cellBorder = "1.5px solid #EF4444";
              textColor = "#DC2626";
            } else if (isRest) {
              cellBg = "#F1F5F9";
              cellBorder = "1px dashed #CBD5E1";
              textColor = "#94A3B8";
            }

            if (isToday) {
              cellBorder = "2.5px solid #0284C7";
            }

            return (
              <Box
                key={day.dayNumber}
                onClick={() => setSelectedDay(day)}
                sx={{
                  minHeight: 82,
                  p: 1.2,
                  borderRadius: 2.5,
                  background: cellBg,
                  border: cellBorder,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "all 0.15s ease",
                  opacity: isLocked ? 0.75 : 1,
                  boxShadow: isCompleted && energyLvl === 5 ? energyStyle.shadow : "none",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 15px rgba(0, 0, 0, 0.08)",
                    opacity: 1,
                  },
                }}
              >
                {/* Day Number and Photo or Lock Icon */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 800,
                      color: isToday ? "#0284C7" : textColor,
                    }}
                  >
                    {day.dayNumber}
                  </Typography>

                  {isLocked ? (
                    <LockIcon sx={{ fontSize: 14, color: "#94A3B8" }} />
                  ) : day.photo ? (
                    <PhotoCameraIcon sx={{ fontSize: 16, color: isCompleted && energyLvl === 5 ? "#FFFFFF" : "#10B981" }} />
                  ) : null}
                </Box>

                {/* Day status badge & Health Energy Indicator */}
                <Box>
                  {isLocked && (
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        fontSize: "0.65rem",
                        color: "#94A3B8",
                        fontWeight: 600,
                      }}
                    >
                      Chờ check-in
                    </Typography>
                  )}
                  {isCompleted && (
                    <Box sx={{ mt: 0.3 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                        <FavoriteIcon sx={{ fontSize: 10, color: energyLvl === 5 ? "#FFFFFF" : (energyLvl >= 3 ? "#065F46" : "#E11D48") }} />
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: "0.64rem",
                            fontWeight: 800,
                            color: textColor,
                            lineHeight: 1,
                          }}
                        >
                          {energyStyle.label}
                        </Typography>
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          fontSize: "0.62rem",
                          fontWeight: 700,
                          color: textColor,
                          opacity: energyLvl === 5 ? 0.95 : 0.85,
                          mt: 0.2,
                        }}
                      >
                        ⏱ {day.durationMinutes || 35}p
                      </Typography>
                    </Box>
                  )}
                  {isMissed && (
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        color: "#DC2626",
                      }}
                    >
                      Bỏ lỡ
                    </Typography>
                  )}
                  {isRest && (
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        fontSize: "0.68rem",
                        color: "#94A3B8",
                      }}
                    >
                      Nghỉ
                    </Typography>
                  )}
                  {isToday && (
                    <Chip
                      label="Hôm nay"
                      size="small"
                      sx={{ height: 16, fontSize: "0.6rem", bgcolor: "#0284C7", color: "#fff", fontWeight: 800, mt: 0.3 }}
                    />
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Card>

      {/* Day Details Modal — Thiết kế chuẩn sát với WorkoutJournalDialog */}
      <Dialog
        open={Boolean(selectedDay)}
        onClose={() => setSelectedDay(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3.5,
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          },
        }}
      >
        {selectedDay && (
          <>
            {selectedDay.status === "locked" || selectedDay.status === "future" ? (
              /* Modal: Lộ trình đang tạm khóa */
              <>
                <DialogTitle sx={{ textAlign: "center", pb: 1, pt: 2, flexShrink: 0 }}>
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      bgcolor: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 1.5,
                    }}
                  >
                    <LockIcon sx={{ fontSize: 26, color: "#64748B" }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: "#0F172A" }}>
                    Lộ Trình Tuần Mới Đang Tạm Khóa
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600 }}>
                    Ngày {selectedDay.dayNumber} {MONTH_NAMES[currentMonthIndex]}
                  </Typography>
                </DialogTitle>

                <DialogContent sx={{ textAlign: "center", py: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 440, mx: "auto", lineHeight: 1.6, fontSize: "0.85rem" }}>
                    Lộ trình tập luyện tuần này chưa được mở khóa. Hãy hoàn thành các buổi tập của tuần hiện tại và thực hiện <strong>Check-in chỉ số thể chất hàng tuần</strong> tại mục Hồ sơ để AI phân tích và tự động mở khóa tuần tiếp theo!
                  </Typography>
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 1.5, borderTop: "1px solid #E2E8F0", bgcolor: "#FAFAFA", flexShrink: 0, gap: 1 }}>
                  <Button
                    onClick={() => {
                      setSelectedDay(null);
                      navigate("/profile");
                    }}
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{
                      py: 0.9,
                      borderRadius: "10px",
                      fontWeight: 800,
                      background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                    }}
                  >
                    Đi Tới Check-in & Mở Khóa
                  </Button>
                  <Button onClick={() => setSelectedDay(null)} variant="outlined" sx={{ borderRadius: "10px", color: "#64748B" }}>
                    Đóng
                  </Button>
                </DialogActions>
              </>
            ) : selectedDay.status === "completed" ? (
              /* Modal: Nhật Ký Buổi Tập Hoàn Thành (Sát 100% với WorkoutJournalDialog) */
              (() => {
                const currentDiffObj =
                  DIFFICULTY_OPTIONS.find((d) => d.value === (selectedDay.difficulty || 3)) ||
                  DIFFICULTY_OPTIONS[2];
                const currentEnergyObj =
                  ENERGY_OPTIONS.find((e) => e.value === (selectedDay.energy || 4)) ||
                  ENERGY_OPTIONS[3];

                return (
                  <>
                    <DialogTitle sx={{ textAlign: "center", pb: 1, pt: 2, flexShrink: 0 }}>
                      <Box
                        sx={{
                          display: "inline-flex",
                          p: 1.2,
                          borderRadius: "50%",
                          bgcolor: "#DCFCE7",
                          color: "#16A34A",
                          mb: 0.8,
                        }}
                      >
                        <EmojiEventsIcon sx={{ fontSize: 32 }} />
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 850, color: "#0F172A", lineHeight: 1.2 }}>
                        Nhật Ký Ngày {selectedDay.dayNumber} {MONTH_NAMES[currentMonthIndex]} — Hoàn Thành! 🎉
                      </Typography>
                      <Typography variant="subtitle2" sx={{ color: "#475569", fontWeight: 700, mt: 0.5, fontSize: "0.85rem" }}>
                        {selectedDay.title}
                      </Typography>

                      {/* Subtle Session Summary */}
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 2,
                          mt: 1.2,
                          px: 2,
                          py: 0.6,
                          borderRadius: 2,
                          bgcolor: "#F8FAFC",
                          border: "1px solid #E2E8F0",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                          <TimerIcon sx={{ color: "#0284C7", fontSize: 18 }} />
                          <Typography variant="body2" sx={{ fontWeight: 700, color: "#1E293B", fontSize: "0.82rem" }}>
                            Thời lượng: {selectedDay.durationMinutes || 35} phút
                          </Typography>
                        </Box>
                        <Box sx={{ width: "1px", height: 14, bgcolor: "#CBD5E1" }} />
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <LocalFireDepartmentIcon sx={{ color: "#94A3B8", fontSize: 16 }} />
                          <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600 }}>
                            Ước tính ~{selectedDay.calories || 350} kcal
                          </Typography>
                        </Box>
                      </Box>
                    </DialogTitle>

                    <DialogContent
                      dividers
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        py: 2,
                        overflowY: "auto",
                        "&::-webkit-scrollbar": { width: "6px" },
                        "&::-webkit-scrollbar-track": { background: "#F8FAFC", borderRadius: "4px" },
                        "&::-webkit-scrollbar-thumb": { background: "#CBD5E1", borderRadius: "4px", "&:hover": { background: "#94A3B8" } },
                      }}
                    >
                      {/* 1. ⭐ Difficulty (5 biểu tượng sấm chớp) */}
                      <Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.8, flexWrap: "wrap", gap: 0.6 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                            <BoltIcon sx={{ color: "#F59E0B", fontSize: 22 }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0F172A", fontSize: "0.88rem" }}>
                              1. Độ khó buổi tập (Difficulty)
                            </Typography>
                          </Box>
                          <Chip
                            label={currentDiffObj.label}
                            size="small"
                            sx={{
                              height: 22,
                              fontWeight: 800,
                              fontSize: "0.72rem",
                              bgcolor: currentDiffObj.bgcolor,
                              color: currentDiffObj.color,
                              border: `1px solid ${currentDiffObj.border}`,
                            }}
                          />
                        </Box>

                        {/* 5 Biểu tượng Sấm Chớp */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-around",
                            py: 1,
                            px: 2,
                            bgcolor: "#F8FAFC",
                            borderRadius: "12px",
                            border: "1px solid #E2E8F0",
                          }}
                        >
                          {[1, 2, 3, 4, 5].map((lvl) => {
                            const isFilled = (selectedDay.difficulty || 3) >= lvl;
                            const isSelected = (selectedDay.difficulty || 3) === lvl;
                            const diffColor = isFilled
                              ? lvl <= 2 ? "#10B981" : lvl === 3 ? "#2563EB" : lvl === 4 ? "#F59E0B" : "#EF4444"
                              : "#CBD5E1";

                            return (
                              <Box
                                key={lvl}
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  p: "4px 8px",
                                  borderRadius: "10px",
                                  transform: isSelected ? "scale(1.15)" : "scale(1)",
                                }}
                              >
                                <BoltIcon
                                  sx={{
                                    fontSize: 32,
                                    color: diffColor,
                                    filter: isFilled ? "drop-shadow(0 2px 4px rgba(245, 158, 11, 0.35))" : "none",
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontWeight: isSelected ? 800 : 600,
                                    fontSize: "0.68rem",
                                    color: isSelected ? diffColor : "#64748B",
                                    mt: 0.2,
                                  }}
                                >
                                  Mức {lvl}
                                </Typography>
                              </Box>
                            );
                          })}
                        </Box>
                      </Box>

                      {/* 2. ⭐ Energy (5 biểu tượng trái tim) */}
                      <Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.8, flexWrap: "wrap", gap: 0.6 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                            <FavoriteIcon sx={{ color: "#E11D48", fontSize: 20 }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0F172A", fontSize: "0.88rem" }}>
                              2. Mức năng lượng sau buổi tập (Energy)
                            </Typography>
                          </Box>
                          <Chip
                            label={currentEnergyObj.label}
                            size="small"
                            sx={{
                              height: 22,
                              fontWeight: 800,
                              fontSize: "0.72rem",
                              bgcolor: currentEnergyObj.bgcolor,
                              color: currentEnergyObj.color,
                              border: `1px solid ${currentEnergyObj.border}`,
                            }}
                          />
                        </Box>

                        {/* 5 Biểu tượng Trái Tim */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-around",
                            py: 1,
                            px: 2,
                            bgcolor: "#FFF5F7",
                            borderRadius: "12px",
                            border: "1px solid #FFE4E6",
                          }}
                        >
                          {[1, 2, 3, 4, 5].map((lvl) => {
                            const isFilled = (selectedDay.energy || 4) >= lvl;
                            const isSelected = (selectedDay.energy || 4) === lvl;
                            const heartColor = isFilled
                              ? lvl === 1 ? "#94A3B8" : lvl === 2 ? "#FB7185" : lvl === 3 ? "#F43F5E" : lvl === 4 ? "#E11D48" : "#BE123C"
                              : "#FECDD3";

                            return (
                              <Box
                                key={lvl}
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  p: "4px 8px",
                                  borderRadius: "10px",
                                  transform: isSelected ? "scale(1.15)" : "scale(1)",
                                }}
                              >
                                <FavoriteIcon
                                  sx={{
                                    fontSize: 30,
                                    color: heartColor,
                                    filter: isFilled ? "drop-shadow(0 2px 4px rgba(225, 29, 72, 0.3))" : "none",
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontWeight: isSelected ? 800 : 600,
                                    fontSize: "0.68rem",
                                    color: isSelected ? heartColor : "#881337",
                                    mt: 0.2,
                                  }}
                                >
                                  Mức {lvl}
                                </Typography>
                              </Box>
                            );
                          })}
                        </Box>
                      </Box>

                      {/* 3. ⭐ Pain / Discomfort (Đau nhức & Khó chịu) */}
                      <Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 0.8 }}>
                          <HealingIcon sx={{ color: "#E11D48", fontSize: 20 }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0F172A", fontSize: "0.88rem" }}>
                            3. Đau nhức / Khó chịu thể chất
                          </Typography>
                        </Box>

                        {!selectedDay.hasPain ? (
                          <Box
                            sx={{
                              p: 1.2,
                              borderRadius: "10px",
                              border: "1.8px solid #16A34A",
                              bgcolor: "#F0FDF4",
                              display: "flex",
                              alignItems: "center",
                              gap: 0.8,
                            }}
                          >
                            <CheckCircleRoundedIcon sx={{ fontSize: 20, color: "#16A34A" }} />
                            <Typography variant="body2" sx={{ fontWeight: 800, color: "#15803D", fontSize: "0.82rem" }}>
                              Hoàn toàn ổn, không đau nhức bất thường
                            </Typography>
                          </Box>
                        ) : (
                          <Box sx={{ p: 1.5, borderRadius: "10px", bgcolor: "#FFF1F2", border: "1.8px solid #E11D48" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 1 }}>
                              <WarningAmberRoundedIcon sx={{ fontSize: 20, color: "#E11D48" }} />
                              <Typography variant="body2" sx={{ fontWeight: 800, color: "#BE123C", fontSize: "0.82rem" }}>
                                Có đau nhức tại các vị trí:
                              </Typography>
                            </Box>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8, mb: 0.8 }}>
                              {(selectedDay.painLocations || []).map((id) => {
                                const areaLabel = PAIN_AREAS.find((a) => a.id === id)?.label || id;
                                return (
                                  <Chip
                                    key={id}
                                    label={areaLabel}
                                    size="small"
                                    sx={{
                                      borderRadius: "8px",
                                      fontWeight: 800,
                                      fontSize: "0.75rem",
                                      bgcolor: "#E11D48",
                                      color: "#FFFFFF",
                                    }}
                                  />
                                );
                              })}
                            </Box>
                            <Typography variant="caption" sx={{ color: "#BE123C", fontSize: "0.7rem", display: "block" }}>
                              💡 AI Coach đã ghi nhận để sàng lọc bài tập ở các buổi tiếp theo.
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {/* 4. 📸 Check-in Photo */}
                      {selectedDay.photo && (
                        <Box sx={{ p: 1.5, borderRadius: "12px", border: "1px solid #E2E8F0", bgcolor: "#F8FAFC" }}>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: "#334155", display: "block", mb: 0.8, fontSize: "0.75rem" }}>
                            📸 Ảnh Check-in vóc dáng ngày này:
                          </Typography>
                          <Box
                            sx={{
                              width: 140,
                              height: 140,
                              borderRadius: 2,
                              overflow: "hidden",
                              border: "2px solid #16A34A",
                              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                            }}
                          >
                            <Box
                              component="img"
                              src={selectedDay.photo}
                              alt="Body Check-in"
                              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          </Box>
                        </Box>
                      )}

                      {/* 5. 📝 Personal Notes */}
                      {selectedDay.note && (
                        <Box sx={{ p: 1.5, borderRadius: "12px", border: "1px solid #E2E8F0", bgcolor: "#F8FAFC" }}>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: "#334155", display: "block", mb: 0.5, fontSize: "0.75rem" }}>
                            📝 Ghi chú nhật ký riêng:
                          </Typography>
                          <Typography variant="body2" sx={{ fontStyle: "italic", color: "#334155", fontSize: "0.82rem", lineHeight: 1.5 }}>
                            "{selectedDay.note}"
                          </Typography>
                        </Box>
                      )}

                      {/* 6. AI Encouragement Alert */}
                      <Alert severity="success" sx={{ textAlign: "left", borderRadius: 2, fontSize: "0.8rem", lineHeight: 1.4 }}>
                        {selectedDay.encouragement || "Tuyệt vời lắm! Mỗi giọt mồ hôi hôm nay là một bước tiến gần hơn đến vóc dáng mơ ước! 🌟"}
                      </Alert>
                    </DialogContent>

                    <DialogActions sx={{ px: 3, py: 1.5, borderTop: "1px solid #E2E8F0", bgcolor: "#FAFAFA", flexShrink: 0 }}>
                      <Button
                        variant="contained"
                        onClick={() => setSelectedDay(null)}
                        fullWidth
                        sx={{
                          py: 1,
                          borderRadius: "10px",
                          fontWeight: 800,
                          fontSize: "0.88rem",
                          background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                          boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                          "&:hover": {
                            background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                          },
                        }}
                      >
                        Đóng Nhật Ký
                      </Button>
                    </DialogActions>
                  </>
                );
              })()
            ) : selectedDay.status === "missed" ? (
              /* Modal: Buổi tập bị bỏ lỡ */
              <>
                <DialogTitle sx={{ textAlign: "center", pb: 1, pt: 2, flexShrink: 0 }}>
                  <Box
                    sx={{
                      display: "inline-flex",
                      p: 1.2,
                      borderRadius: "50%",
                      bgcolor: "#FEF2F2",
                      color: "#DC2626",
                      mb: 0.8,
                    }}
                  >
                    <WarningAmberRoundedIcon sx={{ fontSize: 32 }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 850, color: "#0F172A", lineHeight: 1.2 }}>
                    Ngày {selectedDay.dayNumber} {MONTH_NAMES[currentMonthIndex]} — Bỏ Lỡ Buổi Tập
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: "#EF4444", fontWeight: 700, mt: 0.4, fontSize: "0.85rem" }}>
                    {selectedDay.title}
                  </Typography>
                </DialogTitle>

                <DialogContent sx={{ py: 2 }}>
                  {selectedDay.note && (
                    <Box sx={{ p: 1.5, borderRadius: "10px", bgcolor: "#FFF1F2", border: "1px solid #FECDD3", mb: 2 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "#BE123C", display: "block", mb: 0.3 }}>
                        Lý do ghi nhận:
                      </Typography>
                      <Typography variant="body2" sx={{ fontStyle: "italic", color: "#475569", fontSize: "0.82rem" }}>
                        "{selectedDay.note}"
                      </Typography>
                    </Box>
                  )}

                  <Alert severity="warning" sx={{ borderRadius: 2, fontSize: "0.82rem", lineHeight: 1.5 }}>
                    💡 <strong>Lời khuyên từ AI Coach:</strong> Đừng quá bận tâm vì một buổi bỏ lỡ! Hãy uống đủ nước, nghỉ ngơi tốt và sẵn sàng quay lại mạnh mẽ vào buổi tập ngày mai để giữ vững chuỗi thói quen.
                  </Alert>
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 1.5, borderTop: "1px solid #E2E8F0", bgcolor: "#FAFAFA", flexShrink: 0 }}>
                  <Button
                    variant="contained"
                    onClick={() => setSelectedDay(null)}
                    fullWidth
                    sx={{
                      py: 0.9,
                      borderRadius: "10px",
                      fontWeight: 800,
                      bgcolor: "#475569",
                      "&:hover": { bgcolor: "#334155" },
                    }}
                  >
                    Đóng
                  </Button>
                </DialogActions>
              </>
            ) : (
              /* Modal: Ngày nghỉ phục hồi */
              <>
                <DialogTitle sx={{ textAlign: "center", pb: 1, pt: 2, flexShrink: 0 }}>
                  <Box
                    sx={{
                      display: "inline-flex",
                      p: 1.2,
                      borderRadius: "50%",
                      bgcolor: "#F1F5F9",
                      color: "#475569",
                      mb: 0.8,
                    }}
                  >
                    <SelfImprovementIcon sx={{ fontSize: 32 }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 850, color: "#0F172A", lineHeight: 1.2 }}>
                    Ngày {selectedDay.dayNumber} {MONTH_NAMES[currentMonthIndex]} — Nghỉ Phục Hồi 🧘
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: "#64748B", fontWeight: 700, mt: 0.4, fontSize: "0.85rem" }}>
                    Nghỉ ngơi có kế hoạch để cơ bắp tái tạo
                  </Typography>
                </DialogTitle>

                <DialogContent sx={{ py: 2 }}>
                  <Alert severity="info" sx={{ borderRadius: 2, fontSize: "0.82rem", lineHeight: 1.5, bgcolor: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0" }}>
                    🌿 <strong>Chiến lược phục hồi AI:</strong> Nghỉ ngơi là lúc các sợi cơ siêu vi được hàn gắn và trở nên săn chắc hơn. Hãy uống đủ 2–2.5L nước, bổ sung bữa ăn giàu protein và ngủ đủ 7–8 tiếng.
                  </Alert>
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 1.5, borderTop: "1px solid #E2E8F0", bgcolor: "#FAFAFA", flexShrink: 0 }}>
                  <Button
                    variant="contained"
                    onClick={() => setSelectedDay(null)}
                    fullWidth
                    sx={{
                      py: 0.9,
                      borderRadius: "10px",
                      fontWeight: 800,
                      bgcolor: "#16A34A",
                      "&:hover": { bgcolor: "#15803D" },
                    }}
                  >
                    Đã Hiểu & Nghỉ Ngơi
                  </Button>
                </DialogActions>
              </>
            )}
          </>
        )}
      </Dialog>
    </Box>
  );
}
