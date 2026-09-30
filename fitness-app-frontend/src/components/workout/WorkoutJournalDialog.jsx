import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Rating,
  Box,
  Chip,
  TextField,
  Alert,
  IconButton,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import TimerIcon from "@mui/icons-material/Timer";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";

const FEELING_OPTIONS = [
  { value: "energetic", label: "Tràn đầy năng lượng 🔥", color: "success" },
  { value: "moderate", label: "Vừa sức 💪", color: "primary" },
  { value: "tired", label: "Đuối sức / Rất mệt 🥵", color: "warning" },
];

const ENCOURAGEMENTS = [
  "Tuyệt vời lắm! Mỗi giọt mồ hôi hôm nay là một bước tiến gần hơn đến vóc dáng mơ ước! 🌟",
  "Xuất sắc! Bạn đã vượt qua sự lười biếng và hoàn thành trọn vẹn mục tiêu hôm nay! 🔥",
  "Rất tự hào về bạn! Đừng quên nạp bữa ăn giàu protein và uống đủ nước để cơ bắp hồi phục nhé! 💧",
  "Kỷ luật hôm nay tạo nên sự tự tin ngày mai. Hãy tiếp tục giữ vững ngọn lửa này! ✨",
];

const SAMPLE_PHOTOS = [
  "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&auto=format&fit=crop&q=80",
];

export default function WorkoutJournalDialog({
  open,
  routine,
  onClose,
  onSubmitJournal,
}) {
  const [rating, setRating] = useState(5);
  const [feeling, setFeeling] = useState("energetic");
  const [notes, setNotes] = useState("");
  const [checkInPhoto, setCheckInPhoto] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [encouragementText, setEncouragementText] = useState("");

  if (!routine) return null;

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCheckInPhoto(url);
    }
  };

  const handleUseSamplePhoto = () => {
    const sample = SAMPLE_PHOTOS[Math.floor(Math.random() * SAMPLE_PHOTOS.length)];
    setCheckInPhoto(sample);
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
      rating,
      feeling,
      feelingLabel:
        FEELING_OPTIONS.find((f) => f.value === feeling)?.label || "Vừa sức",
      notes: notes || "Hoàn thành buổi tập đầy quyết tâm!",
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
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={submitted ? handleFinishClose : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, p: 1 },
      }}
    >
      {!submitted ? (
        <>
          <DialogTitle sx={{ textAlign: "center", pb: 1 }}>
            <Box
              sx={{
                display: "inline-flex",
                p: 1.5,
                borderRadius: "50%",
                bgcolor: "#DCFCE7",
                color: "#16A34A",
                mb: 1,
              }}
            >
              <EmojiEventsIcon sx={{ fontSize: 36 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Chúc mừng bạn đã hoàn thành! 🎉
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ghi lại cảm nhận & lưu ảnh vóc dáng để theo dõi sự chuyển mình
            </Typography>
          </DialogTitle>

          <DialogContent>
            {/* Summary Badge */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 4,
                p: 2,
                mb: 2.5,
                borderRadius: 2.5,
                bgcolor: "#F7F8FA",
                border: "1px solid #E5E7EB",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LocalFireDepartmentIcon sx={{ color: "#EF4444" }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Tổng Calo
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    ~{routine.totalCalories} kcal
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TimerIcon sx={{ color: "#0284C7" }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Thời lượng
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    {routine.totalMinutes} phút
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Check-in Photo Upload Section (Feature Requested) */}
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: "#1F2937" }}>
                📸 Ảnh Check-in vóc dáng hôm nay (Tùy chọn):
              </Typography>

              {checkInPhoto ? (
                <Box
                  sx={{
                    position: "relative",
                    width: 140,
                    height: 140,
                    borderRadius: 2.5,
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
                <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<AddPhotoAlternateIcon />}
                    sx={{ borderColor: "#D1D5DB", color: "#4B5563" }}
                  >
                    Tải ảnh từ máy / Chụp
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handlePhotoUpload}
                    />
                  </Button>

                  <Button
                    size="small"
                    onClick={handleUseSamplePhoto}
                    sx={{ color: "#16A34A", textDecoration: "underline" }}
                  >
                    Dùng ảnh mẫu thử nghiệm
                  </Button>
                </Box>
              )}
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                Ảnh sẽ được gắn vào ô ngày trên Lịch Tháng để bạn theo dõi hành trình thay đổi body.
              </Typography>
            </Box>

            {/* Rating Stars */}
            <Box sx={{ textAlign: "center", mb: 2.5 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                Bạn chấm buổi tập hôm nay mấy sao?
              </Typography>
              <Rating
                value={rating}
                onChange={(_, val) => setRating(val || 5)}
                size="large"
                emptyIcon={<StarIcon style={{ opacity: 0.3 }} fontSize="inherit" />}
              />
            </Box>

            {/* Feeling Chips */}
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                Cảm nhận thể lực của bạn:
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {FEELING_OPTIONS.map((opt) => (
                  <Chip
                    key={opt.value}
                    label={opt.label}
                    onClick={() => setFeeling(opt.value)}
                    variant={feeling === opt.value ? "filled" : "outlined"}
                    color={feeling === opt.value ? "primary" : "default"}
                    sx={{ cursor: "pointer", fontWeight: 600, py: 1.8 }}
                  />
                ))}
              </Box>
            </Box>

            {/* Notes */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                Ghi chú nhật ký cá nhân:
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="Ví dụ: Hôm nay cơ bụng siết rất đầm, hoàn thành trọn vẹn cả bài khởi động lẫn bài chính..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={onClose} color="inherit">
              Bỏ qua
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              sx={{ px: 4, fontWeight: 700 }}
            >
              Lưu vào nhật ký
            </Button>
          </DialogActions>
        </>
      ) : (
        /* Encouragement Screen */
        <Box sx={{ p: 4, textAlign: "center" }}>
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
            <EmojiEventsIcon sx={{ fontSize: 48 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            Đã lưu vào nhật ký rèn luyện! ✨
          </Typography>
          <Alert severity="success" sx={{ my: 2, textAlign: "left", borderRadius: 2 }}>
            {encouragementText}
          </Alert>

          {checkInPhoto && (
            <Box sx={{ my: 2 }}>
              <Typography variant="caption" sx={{ color: "#6B7280", display: "block", mb: 0.5 }}>
                Đã lưu 1 ảnh check-in vóc dáng vào Lịch Tháng 📸
              </Typography>
              <Box
                component="img"
                src={checkInPhoto}
                alt="Saved Checkin"
                sx={{ width: 100, height: 100, objectFit: "cover", borderRadius: 2 }}
              />
            </Box>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Chỉ số calo (~{routine.totalCalories} kcal) đã được cộng dồn vào Dashboard!
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleFinishClose}
            fullWidth
            sx={{ fontWeight: 700 }}
          >
            Tuyệt vời! Tiếp tục ngày mới
          </Button>
        </Box>
      )}
    </Dialog>
  );
}
