import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  TextField,
  Alert,
  IconButton,
  Collapse,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import TimerIcon from "@mui/icons-material/Timer";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import BoltIcon from "@mui/icons-material/Bolt";
import FavoriteIcon from "@mui/icons-material/Favorite";
import HealingIcon from "@mui/icons-material/Healing";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import {
  DIFFICULTY_OPTIONS,
  ENERGY_OPTIONS,
  PAIN_AREAS,
  ENCOURAGEMENTS,
} from "../../data/mockWorkouts";

export default function WorkoutJournalDialog({
  open,
  routine,
  onClose,
  onSubmitJournal,
}) {
  // 1. Difficulty State (1-5 biểu tượng sấm)
  const [difficulty, setDifficulty] = useState(3);
  const [hoverDiff, setHoverDiff] = useState(0);

  // 2. Energy State (1-5 biểu tượng trái tim)
  const [energy, setEnergy] = useState(4);
  const [hoverEnergy, setHoverEnergy] = useState(0);

  // 3. Pain / Discomfort
  const [hasPain, setHasPain] = useState(false);
  const [painLocations, setPainLocations] = useState([]);

  // 4. Optional Photo & Notes
  const [showOptional, setShowOptional] = useState(false);
  const [notes, setNotes] = useState("");
  const [checkInPhoto, setCheckInPhoto] = useState(null);

  // Submission state
  const [submitted, setSubmitted] = useState(false);
  const [encouragementText, setEncouragementText] = useState("");

  if (!routine) return null;

  // Resolved option objects for displaying labels dynamically
  const activeDiffValue = hoverDiff || difficulty;
  const currentDiffObj = DIFFICULTY_OPTIONS.find((d) => d.value === activeDiffValue) || DIFFICULTY_OPTIONS[2];

  const activeEnergyValue = hoverEnergy || energy;
  const currentEnergyObj = ENERGY_OPTIONS.find((e) => e.value === activeEnergyValue) || ENERGY_OPTIONS[3];

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCheckInPhoto(url);
    }
  };

  const togglePainLocation = (id) => {
    setPainLocations((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    const randomEncouragement =
      ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
    setEncouragementText(randomEncouragement);
    setSubmitted(true);

    const journalEntry = {
      id: "j_" + Date.now(),
      date: new Date().toLocaleDateString("vi-VN"),
      workoutTitle: routine.focusTitle || "Buổi tập hoàn thành",
      durationMinutes: routine.totalMinutes || 35,
      caloriesBurned: routine.totalCalories || 320,
      difficulty,
      rating: difficulty, // Tương thích ngược với các component hiển thị rating sao
      difficultyLabel: currentDiffObj.label,
      energy,
      energyLabel: currentEnergyObj.label,
      feeling: energy >= 4 ? "energetic" : energy === 3 ? "moderate" : "tired",
      feelingLabel: currentEnergyObj.label,
      hasPain,
      painLocations: hasPain ? painLocations : [],
      notes: notes || "Hoàn thành buổi tập!",
      checkInPhoto: checkInPhoto || null,
      encouragement: randomEncouragement,
    };

    if (onSubmitJournal) {
      onSubmitJournal(journalEntry);
    }
  };

  const handleFinishClose = () => {
    setSubmitted(false);
    setNotes("");
    setCheckInPhoto(null);
    setHasPain(false);
    setPainLocations([]);
    setDifficulty(3);
    setHoverDiff(0);
    setEnergy(4);
    setHoverEnergy(0);
    setShowOptional(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={submitted ? handleFinishClose : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        },
      }}
    >
      {!submitted ? (
        <>
          <DialogTitle sx={{ textAlign: "center", pb: 1, pt: 1.5, flexShrink: 0 }}>
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
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#0F172A" }}>
              Hoàn Thành Buổi Tập! 🎉
            </Typography>


            {/* Subtle Session Summary (Giảm prominence của Calories) */}
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 2,
                mt: 1.5,
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
                  Thời lượng: {routine.totalMinutes} phút
                </Typography>
              </Box>
              <Box sx={{ width: "1px", height: 14, bgcolor: "#CBD5E1" }} />
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <LocalFireDepartmentIcon sx={{ color: "#94A3B8", fontSize: 16 }} />
                <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600 }}>
                  Ước tính ~{routine.totalCalories} kcal
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
              "&::-webkit-scrollbar": {
                width: "6px",
              },
              "&::-webkit-scrollbar-track": {
                background: "#F8FAFC",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "#CBD5E1",
                borderRadius: "4px",
                "&:hover": {
                  background: "#94A3B8",
                },
              },
            }}
          >
            {/* 1. ⭐ Difficulty (5 biểu tượng sấm chớp) */}
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.8, flexWrap: "wrap", gap: 0.6 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                  <BoltIcon sx={{ color: "#F59E0B", fontSize: 22 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0F172A", fontSize: "0.88rem" }}>
                    1. Độ khó buổi tập hôm nay (Difficulty)
                  </Typography>
                </Box>

                {/* Hiện chữ tương ứng khi hover / click vào icon sấm */}
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
                    transition: "all 0.15s ease",
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
                  const isFilled = activeDiffValue >= lvl;
                  const isSelected = difficulty === lvl;
                  const diffColor = isFilled
                    ? lvl <= 2
                      ? "#10B981"
                      : lvl === 3
                        ? "#2563EB"
                        : lvl === 4
                          ? "#F59E0B"
                          : "#EF4444"
                    : "#CBD5E1";

                  return (
                    <Box
                      key={lvl}
                      onClick={() => setDifficulty(lvl)}
                      onMouseEnter={() => setHoverDiff(lvl)}
                      onMouseLeave={() => setHoverDiff(0)}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        cursor: "pointer",
                        p: "4px 8px",
                        borderRadius: "10px",
                        transition: "all 0.15s ease",
                        transform: isSelected ? "scale(1.18)" : (hoverDiff === lvl ? "scale(1.12)" : "scale(1)"),
                        "&:hover": {
                          bgcolor: "rgba(241, 245, 249, 0.8)",
                        },
                      }}
                    >
                      <BoltIcon
                        sx={{
                          fontSize: 34,
                          color: diffColor,
                          filter: isFilled ? "drop-shadow(0 2px 5px rgba(245, 158, 11, 0.35))" : "none",
                          transition: "color 0.15s ease",
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

                {/* Hiện chữ tương ứng khi hover / click vào icon tim */}
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
                    transition: "all 0.15s ease",
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
                  const isFilled = activeEnergyValue >= lvl;
                  const isSelected = energy === lvl;
                  const heartColor = isFilled
                    ? lvl === 1
                      ? "#94A3B8"
                      : lvl === 2
                        ? "#FB7185"
                        : lvl === 3
                          ? "#F43F5E"
                          : lvl === 4
                            ? "#E11D48"
                            : "#BE123C"
                    : "#FECDD3";

                  return (
                    <Box
                      key={lvl}
                      onClick={() => setEnergy(lvl)}
                      onMouseEnter={() => setHoverEnergy(lvl)}
                      onMouseLeave={() => setHoverEnergy(0)}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        cursor: "pointer",
                        p: "4px 8px",
                        borderRadius: "10px",
                        transition: "all 0.15s ease",
                        transform: isSelected ? "scale(1.18)" : (hoverEnergy === lvl ? "scale(1.12)" : "scale(1)"),
                        "&:hover": {
                          bgcolor: "rgba(255, 228, 230, 0.6)",
                        },
                      }}
                    >
                      <FavoriteIcon
                        sx={{
                          fontSize: 32,
                          color: heartColor,
                          filter: isFilled ? "drop-shadow(0 2px 5px rgba(225, 29, 72, 0.3))" : "none",
                          transition: "color 0.15s ease",
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

            {/* 3. ⭐ Pain / Discomfort (Đau nhức & Khó chịu bất thường) */}
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 0.8 }}>
                <HealingIcon sx={{ color: "#E11D48", fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0F172A", fontSize: "0.88rem" }}>
                  3. Đau nhức / Khó chịu bất thường (Pain & Discomfort)
                </Typography>
              </Box>

              {/* Status Toggle */}
              <Box sx={{ display: "flex", gap: 1, mb: hasPain ? 1 : 0 }}>
                <Box
                  onClick={() => {
                    setHasPain(false);
                    setPainLocations([]);
                  }}
                  sx={{
                    flex: 1,
                    p: 1,
                    borderRadius: "10px",
                    cursor: "pointer",
                    border: !hasPain ? "1.8px solid #16A34A" : "1px solid #E2E8F0",
                    bgcolor: !hasPain ? "#F0FDF4" : "#F8FAFC",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0.8,
                    transition: "all 0.15s ease",
                  }}
                >
                  <CheckCircleRoundedIcon sx={{ fontSize: 18, color: !hasPain ? "#16A34A" : "#94A3B8" }} />
                  <Typography variant="body2" sx={{ fontWeight: !hasPain ? 800 : 600, color: !hasPain ? "#15803D" : "#64748B", fontSize: "0.78rem" }}>
                    Hoàn toàn ổn, không đau nhức
                  </Typography>
                </Box>

                <Box
                  onClick={() => setHasPain(true)}
                  sx={{
                    flex: 1,
                    p: 1,
                    borderRadius: "10px",
                    cursor: "pointer",
                    border: hasPain ? "1.8px solid #E11D48" : "1px solid #E2E8F0",
                    bgcolor: hasPain ? "#FFF1F2" : "#F8FAFC",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0.8,
                    transition: "all 0.15s ease",
                  }}
                >
                  <WarningAmberRoundedIcon sx={{ fontSize: 18, color: hasPain ? "#E11D48" : "#94A3B8" }} />
                  <Typography variant="body2" sx={{ fontWeight: hasPain ? 800 : 600, color: hasPain ? "#BE123C" : "#64748B", fontSize: "0.78rem" }}>
                    Có đau nhức bất thường
                  </Typography>
                </Box>
              </Box>

              {/* Expandable Pain Area Chips when hasPain is true */}
              <Collapse in={hasPain}>
                <Box sx={{ p: 1.2, borderRadius: "10px", bgcolor: "#FFF1F2", border: "1px dashed #FECDD3" }}>
                  <Typography variant="caption" sx={{ color: "#9F1239", fontWeight: 700, display: "block", mb: 0.8 }}>
                    Chọn các vị trí bạn cảm thấy đau nhức / ê buốt:
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
                    {PAIN_AREAS.map((area) => {
                      const isSelected = painLocations.includes(area.id);
                      return (
                        <Chip
                          key={area.id}
                          label={area.label}
                          clickable
                          onClick={() => togglePainLocation(area.id)}
                          sx={{
                            borderRadius: "8px",
                            fontWeight: isSelected ? 800 : 600,
                            fontSize: "0.75rem",
                            bgcolor: isSelected ? "#E11D48" : "#FFFFFF",
                            color: isSelected ? "#FFFFFF" : "#881337",
                            border: isSelected ? "1.5px solid #BE123C" : "1px solid #FECDD3",
                            "&:hover": {
                              bgcolor: isSelected ? "#BE123C" : "#FFE4E6",
                            },
                          }}
                        />
                      );
                    })}
                  </Box>
                  <Typography variant="caption" sx={{ color: "#BE123C", fontSize: "0.68rem", display: "block", mt: 0.8 }}>
                    💡 AI Coach sẽ tự động sàng lọc & loại bỏ các bài tập áp lực lên các vùng này ở các buổi tiếp theo.
                  </Typography>
                </Box>
              </Collapse>
            </Box>

            {/* 4. ⭐ Thu gọn Photo + Diary thành optional */}
            <Box
              sx={{
                border: "1px solid #E2E8F0",
                borderRadius: "12px",
                bgcolor: "#F8FAFC",
                overflow: "hidden",
                transition: "all 0.2s ease",
              }}
            >
              <Box
                onClick={() => setShowOptional(!showOptional)}
                sx={{
                  p: "10px 14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  userSelect: "none",
                  "&:hover": { bgcolor: "#F1F5F9" },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AddPhotoAlternateIcon sx={{ color: "#64748B", fontSize: 18 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#334155", fontSize: "0.82rem" }}>
                    Ảnh vóc dáng & Nhật ký cá nhân (Tùy chọn)
                  </Typography>
                  {(checkInPhoto || notes) && (
                    <Chip
                      label="Đã thêm"
                      size="small"
                      color="success"
                      sx={{ height: 18, fontSize: "0.62rem", fontWeight: 750 }}
                    />
                  )}
                </Box>
                <Typography variant="caption" sx={{ color: "#16A34A", fontWeight: 750, fontSize: "0.75rem" }}>
                  {showOptional ? "Thu gọn ▲" : "+ Mở rộng ▼"}
                </Typography>
              </Box>

              <Collapse in={showOptional}>
                <Box sx={{ p: 2, pt: 1, borderTop: "1px dashed #E2E8F0", display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {/* Photo Upload Section */}
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569", display: "block", mb: 0.6 }}>
                      📸 Ảnh Check-in vóc dáng hôm nay:
                    </Typography>

                    {checkInPhoto ? (
                      <Box
                        sx={{
                          position: "relative",
                          width: 120,
                          height: 120,
                          borderRadius: 2,
                          overflow: "hidden",
                          border: "2px solid #16A34A",
                          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                        }}
                      >
                        <Box
                          component="img"
                          src={checkInPhoto}
                          alt="Body Check-in"
                          sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => setCheckInPhoto(null)}
                          sx={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            bgcolor: "rgba(0,0,0,0.6)",
                            color: "#fff",
                            "&:hover": { bgcolor: "#DC2626" },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ) : (
                      <Button
                        variant="outlined"
                        component="label"
                        size="small"
                        startIcon={<AddPhotoAlternateIcon />}
                        sx={{ borderColor: "#CBD5E1", color: "#475569", textTransform: "none", borderRadius: "8px" }}
                      >
                        Tải ảnh từ máy / Chụp
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handlePhotoUpload}
                        />
                      </Button>
                    )}
                  </Box>

                  {/* Personal Notes */}
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569", display: "block", mb: 0.6 }}>
                      📝 Ghi chú nhật ký riêng:
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      multiline
                      rows={2}
                      placeholder="Ví dụ: Cơ đùi trước hơi căng, bài plank hôm nay giữ vững hơn 15 giây..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      sx={{ bgcolor: "#FFFFFF" }}
                    />
                  </Box>
                </Box>
              </Collapse>
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 1.5, gap: 1, flexShrink: 0, borderTop: "1px solid #E2E8F0", bgcolor: "#FAFAFA" }}>
            <Button onClick={onClose} color="inherit" sx={{ fontWeight: 600, fontSize: "0.85rem" }}>
              Bỏ qua
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              sx={{
                px: 3.5,
                py: 0.8,
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
              Lưu Vào Nhật Ký
            </Button>
          </DialogActions>
        </>
      ) : (
        /* Encouragement Screen */
        <Box sx={{ p: 4, textAlign: "center", maxHeight: "90vh", overflowY: "auto" }}>
          <Box
            sx={{
              display: "inline-flex",
              p: 2,
              borderRadius: "50%",
              bgcolor: "#DCFCE7",
              color: "#16A34A",
              mb: 2,
            }}
          >
            <EmojiEventsIcon sx={{ fontSize: 44 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: "#0F172A" }}>
            Đã Lưu Vào Nhật Ký Rèn Luyện! ✨
          </Typography>
          <Alert severity="success" sx={{ my: 2, textAlign: "left", borderRadius: 2 }}>
            {encouragementText}
          </Alert>

          {/* Quick Summary of feedback */}
          <Box sx={{ display: "flex", justifyContent: "center", gap: 1, flexWrap: "wrap", my: 2 }}>
            <Chip
              icon={<BoltIcon sx={{ color: "#F59E0B !important" }} />}
              label={`Độ khó: ${currentDiffObj.label}`}
              size="small"
              sx={{ fontWeight: 700, bgcolor: "#FFFBEB", color: "#B45309" }}
            />
            <Chip
              icon={<FavoriteIcon sx={{ color: "#E11D48 !important" }} />}
              label={`Năng lượng: ${currentEnergyObj.label}`}
              size="small"
              sx={{ fontWeight: 700, bgcolor: "#FFF1F2", color: "#BE123C" }}
            />
            {hasPain && painLocations.length > 0 && (
              <Chip
                label={`Đau nhức: ${painLocations.map((id) => PAIN_AREAS.find((a) => a.id === id)?.label).join(", ")}`}
                size="small"
                sx={{ fontWeight: 700, bgcolor: "#FFE4E6", color: "#BE123C" }}
              />
            )}
          </Box>

          {checkInPhoto && (
            <Box sx={{ my: 1.5 }}>
              <Typography variant="caption" sx={{ color: "#6B7280", display: "block", mb: 0.5 }}>
                Đã lưu 1 ảnh check-in vóc dáng vào Lịch Tháng 📸
              </Typography>
              <Box
                component="img"
                src={checkInPhoto}
                alt="Saved Checkin"
                sx={{ width: 90, height: 90, objectFit: "cover", borderRadius: 2, border: "2px solid #16A34A" }}
              />
            </Box>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontSize: "0.85rem" }}>
            AI Coach đã ghi nhận phản hồi để cá nhân hóa các bài tập kế tiếp!
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleFinishClose}
            fullWidth
            sx={{
              fontWeight: 800,
              borderRadius: "10px",
              background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
            }}
          >
            Tiếp Tục Ngày Mới
          </Button>
        </Box>
      )}
    </Dialog>
  );
}
