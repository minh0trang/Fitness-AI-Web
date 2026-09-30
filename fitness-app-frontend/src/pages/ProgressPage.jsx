import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Rating,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import SelfImprovementIcon from "@mui/icons-material/SelfImprovement";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LockIcon from "@mui/icons-material/Lock";
import MetricCard from "../components/common/MetricCard";
import { MONTHLY_CALENDAR_DATA } from "../data/mockWorkouts";

const DAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

const MONTH_NAMES = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
];

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
  // Days in month
  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  // Day of week of the 1st of this month (0 is Sunday, 1 is Monday... 6 is Saturday)
  const firstDayJs = new Date(currentYear, currentMonthIndex, 1).getDay();
  // Convert JS Sunday=0 to Monday=0, Sunday=6
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
      return (
        MONTHLY_CALENDAR_DATA.find((d) => d.dayNumber === dayNum) || {
          dayNumber: dayNum,
          status: "locked",
          title: "Lộ trình đang tạm khóa",
        }
      );
    }
    // Generate realistic sample distribution for previous months
    const sampleStatuses = ["completed", "completed", "rest", "completed", "missed", "completed", "rest"];
    const status = sampleStatuses[(dayNum + currentMonthIndex) % 7];
    return {
      dayNumber: dayNum,
      status: status,
      calories: status === "completed" ? 380 : 0,
      title: status === "completed" ? "Buổi tập chuyên cần" : status === "rest" ? "Nghỉ ngơi" : "Bỏ lỡ",
    };
  });

  // Calculate monthly stats
  const completedCount = daysList.filter((d) => d.status === "completed").length;
  const missedCount = daysList.filter((d) => d.status === "missed").length;
  const restCount = daysList.filter((d) => d.status === "rest").length;
  const totalTracked = completedCount + missedCount;
  const consistencyRate = totalTracked > 0 ? Math.round((completedCount / totalTracked) * 100) : 0;
  const totalMonthCalories = daysList.reduce((acc, d) => acc + (d.calories || 0), 0);

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Main Monthly Calendar Card */}
      <Card sx={{ borderRadius: 3.5, border: "1px solid #E2E8F0", bgcolor: "#FFFFFF", p: { xs: 2, sm: 3.5 } }}>
        {/* Calendar Navigation Bar & Legend */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
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

          {/* Color Legend */}
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: "3px", bgcolor: "#10B981" }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: "#475569" }}>Đã tập</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: "3px", bgcolor: "#EF4444" }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: "#475569" }}>Bỏ lỡ</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: "3px", bgcolor: "#E2E8F0" }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: "#475569" }}>Ngày nghỉ</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: "3px", border: "2px solid #0284C7", bgcolor: "#E0F2FE" }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: "#475569" }}>Hôm nay</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
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

        {/* Calendar Grid: Perfectly Equal Sized Cells (Uniform Height & Alignment) */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 1.2,
            width: "100%",
          }}
        >
          {/* 1. Leading Padding Cells from Previous Month for Exact Day Alignment */}
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

          {/* 2. Days of Current Month */}
          {daysList.map((day) => {
            const isCompleted = day.status === "completed";
            const isMissed = day.status === "missed";
            const isRest = day.status === "rest";
            const isToday = day.isToday;
            const isLocked = day.status === "locked" || day.status === "future";

            let cellBg = "#F8FAFC";
            let cellBorder = "1px solid #E2E8F0";
            let textColor = "#0F172A";

            if (isLocked) {
              cellBg = "#F8FAFC";
              cellBorder = "1px dashed #CBD5E1";
              textColor = "#94A3B8";
            } else if (isCompleted) {
              cellBg = "rgba(16, 185, 129, 0.12)";
              cellBorder = "1.5px solid #10B981";
              textColor = "#059669";
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
                  bgcolor: cellBg,
                  border: cellBorder,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "all 0.15s ease",
                  opacity: isLocked ? 0.75 : 1,
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
                    <PhotoCameraIcon sx={{ fontSize: 16, color: "#10B981" }} />
                  ) : null}
                </Box>

                {/* Day status badge */}
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
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        fontSize: "0.68rem",
                        fontWeight: 800,
                        color: "#059669",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                      }}
                    >
                      🔥 {day.calories}k
                    </Typography>
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
                      sx={{ height: 16, fontSize: "0.6rem", bgcolor: "#0284C7", color: "#fff", fontWeight: 800 }}
                    />
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Card>

      {/* Day Details Modal */}
      <Dialog
        open={Boolean(selectedDay)}
        onClose={() => setSelectedDay(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}
      >
        {selectedDay && (
          <>
            {selectedDay.status === "locked" || selectedDay.status === "future" ? (
              <>
                <DialogTitle sx={{ pb: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      Ngày {selectedDay.dayNumber} {MONTH_NAMES[currentMonthIndex]}
                    </Typography>
                    <Chip
                      icon={<LockIcon sx={{ fontSize: "14px !important" }} />}
                      label="Đang khóa"
                      size="small"
                      sx={{ fontWeight: 700, bgcolor: "#F1F5F9", color: "#64748B" }}
                    />
                  </Box>
                </DialogTitle>
                <DialogContent>
                  <Box sx={{ textAlign: "center", py: 2 }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        bgcolor: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                        mb: 2,
                      }}
                    >
                      <LockIcon sx={{ fontSize: 28, color: "#64748B" }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: "#0F172A" }}>
                      Lộ trình tuần mới đang tạm khóa
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                      Lộ trình tập luyện tuần này chưa được mở khóa. Hãy hoàn thành các buổi tập của tuần hiện tại và thực hiện <strong>Check-in chỉ số thể chất hàng tuần</strong> tại mục Hồ sơ để AI phân tích và tự động mở khóa tuần tiếp theo!
                    </Typography>
                  </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, flexDirection: "column", gap: 1 }}>
                  <Button
                    onClick={() => {
                      setSelectedDay(null);
                      navigate("/profile");
                    }}
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ fontWeight: 700 }}
                  >
                    Đi Tới Check-in & Mở Khóa
                  </Button>
                  <Button onClick={() => setSelectedDay(null)} variant="text" fullWidth sx={{ fontWeight: 600, color: "#64748B" }}>
                    Đóng
                  </Button>
                </DialogActions>
              </>
            ) : (
              <>
                <DialogTitle sx={{ pb: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      Ngày {selectedDay.dayNumber} {MONTH_NAMES[currentMonthIndex]}
                    </Typography>
                    {selectedDay.status === "completed" && (
                      <Chip label="Đã hoàn thành" color="success" size="small" sx={{ fontWeight: 700 }} />
                    )}
                    {selectedDay.status === "missed" && (
                      <Chip label="Bỏ lỡ buổi tập" color="error" size="small" sx={{ fontWeight: 700 }} />
                    )}
                    {selectedDay.status === "rest" && (
                      <Chip label="Ngày nghỉ phục hồi" size="small" sx={{ fontWeight: 600 }} />
                    )}
                  </Box>
                </DialogTitle>

                <DialogContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: "#0F172A" }}>
                    {selectedDay.title}
                  </Typography>

                  {selectedDay.status === "completed" && (
                    <Box sx={{ display: "flex", gap: 2, my: 1.5 }}>
                      <Chip
                        icon={<LocalFireDepartmentIcon sx={{ color: "#EF4444 !important" }} />}
                        label={`~${selectedDay.calories} kcal`}
                        size="small"
                        sx={{ bgcolor: "#FEE2E2", color: "#991B1B", fontWeight: 700 }}
                      />
                      {selectedDay.rating && (
                        <Rating value={selectedDay.rating} readOnly size="small" />
                      )}
                    </Box>
                  )}

                  {selectedDay.note && (
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "#F8FAFC", border: "1px solid #E2E8F0", my: 1.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontWeight: 700 }}>
                        Ghi chú cá nhân:
                      </Typography>
                      <Typography variant="body2" sx={{ fontStyle: "italic", color: "#334155" }}>
                        "{selectedDay.note}"
                      </Typography>
                    </Box>
                  )}

                  {/* Photo preview */}
                  {selectedDay.photo && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "#0F172A", display: "block", mb: 1 }}>
                        📸 Ảnh check-in vóc dáng ngày này:
                      </Typography>
                      <Box
                        component="img"
                        src={selectedDay.photo}
                        alt="Body Checkin"
                        sx={{
                          width: "100%",
                          maxHeight: 230,
                          objectFit: "cover",
                          borderRadius: 2.5,
                          border: "1px solid #E2E8F0",
                        }}
                      />
                    </Box>
                  )}
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2 }}>
                  <Button onClick={() => setSelectedDay(null)} variant="contained" color="primary" fullWidth sx={{ fontWeight: 700 }}>
                    Đóng
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
