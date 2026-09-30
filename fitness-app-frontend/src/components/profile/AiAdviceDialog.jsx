import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  Chip,
  LinearProgress,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import TimelineIcon from "@mui/icons-material/Timeline";
import LocalDrinkIcon from "@mui/icons-material/LocalDrink";
import ShieldIcon from "@mui/icons-material/Shield";

export default function AiAdviceDialog({
  open,
  onClose,
  profile,
  bmr = 1262,
  tdee = 1735,
  bmi = 20.2,
  deficitCal = 1385,
}) {
  const customWishes = profile?.customWishes || "Mong muốn giảm 3cm vòng eo trước cuối tháng sau, hạn chế các bài nhảy mạnh tránh đau khớp gối.";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3.5,
          border: "1px solid #BBF7D0",
          boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
          overflow: "hidden",
        },
      }}
    >
      {/* Dialog Header */}
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)",
          borderBottom: "1px solid #E2E8F0",
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <Box
            sx={{
              p: 0.8,
              borderRadius: "10px",
              bgcolor: "#16A34A",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AutoAwesomeIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#15803D", lineHeight: 1.15 }}>
              Bản Phân Tích AI Chuyên Sâu & Lời Khuyên Huấn Luyện Viên
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748B", fontSize: "0.72rem" }}>
              Cá nhân hóa theo BMR/TDEE & Nguyện vọng siết eo của {profile?.name || "Minh Trang"}
            </Typography>
          </Box>
        </Box>

        <IconButton onClick={onClose} size="small" sx={{ color: "#64748B" }}>
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2.5, bgcolor: "#FAFAFA" }}>
        <Grid container spacing={2}>
          {/* Section 1: Calorie Deficit & Macro Nutrients */}
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2, borderRadius: 2.5, border: "1px solid #E2E8F0", bgcolor: "#FFFFFF", height: "100%" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.2 }}>
                <RestaurantIcon sx={{ color: "#16A34A", fontSize: 18 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0F172A", fontSize: "0.85rem" }}>
                  1. Chiến Lược Thâm Hụt Calo & Macros
                </Typography>
              </Box>

              <Typography variant="body2" sx={{ color: "#475569", fontSize: "0.78rem", mb: 1.5, lineHeight: 1.4 }}>
                Với TDEE là <strong>{tdee} kcal</strong>, mức nạp lý tưởng để siết eo an toàn là <strong>~{deficitCal} kcal/ngày</strong> (thâm hụt chuẩn 350 kcal, giúp giảm 0.35–0.5kg mỡ/tuần mà không gây mệt mỏi).
              </Typography>

              {/* Macro breakdown */}
              <Box sx={{ bgcolor: "#F8FAFC", p: 1.2, borderRadius: 2, border: "1px solid #EDF2F7", mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.72rem", display: "block", mb: 0.8 }}>
                  Tỷ Lệ Dinh Dưỡng Khuyến Nghị Cho Siết Eo:
                </Typography>

                {/* Protein */}
                <Box sx={{ mb: 0.8 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", fontWeight: 600, color: "#334155", mb: 0.2 }}>
                    <span>Đạm (Protein - Săn cơ bụng): 30%</span>
                    <span style={{ color: "#16A34A", fontWeight: 700 }}>~105g</span>
                  </Box>
                  <LinearProgress variant="determinate" value={30} sx={{ height: 5, borderRadius: 2.5, bgcolor: "#E2E8F0", "& .MuiLinearProgress-bar": { bgcolor: "#16A34A" } }} />
                </Box>

                {/* Carbs */}
                <Box sx={{ mb: 0.8 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", fontWeight: 600, color: "#334155", mb: 0.2 }}>
                    <span>Tinh bột tốt (Complex Carbs): 45%</span>
                    <span style={{ color: "#0284C7", fontWeight: 700 }}>~155g</span>
                  </Box>
                  <LinearProgress variant="determinate" value={45} sx={{ height: 5, borderRadius: 2.5, bgcolor: "#E2E8F0", "& .MuiLinearProgress-bar": { bgcolor: "#0284C7" } }} />
                </Box>

                {/* Fat */}
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", fontWeight: 600, color: "#334155", mb: 0.2 }}>
                    <span>Chất béo tốt (Healthy Fats): 25%</span>
                    <span style={{ color: "#D97706", fontWeight: 700 }}>~38g</span>
                  </Box>
                  <LinearProgress variant="determinate" value={25} sx={{ height: 5, borderRadius: 2.5, bgcolor: "#E2E8F0", "& .MuiLinearProgress-bar": { bgcolor: "#D97706" } }} />
                </Box>
              </Box>
            </Card>
          </Grid>

          {/* Section 2: AI Tailored Plan for Custom Wishes & Joint Safety */}
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2, borderRadius: 2.5, border: "1px solid #BBF7D0", bgcolor: "#FFFFFF", height: "100%" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.2 }}>
                <ShieldIcon sx={{ color: "#059669", fontSize: 18 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0F172A", fontSize: "0.85rem" }}>
                  2. Tối Ưu Lộ Trình Theo Nguyện Vọng Riêng
                </Typography>
              </Box>

              <Box sx={{ bgcolor: "#F0FDF4", p: 1.2, borderRadius: 2, border: "1px solid #DCFCE7", mb: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "#15803D", display: "block", mb: 0.3, fontSize: "0.7rem" }}>
                  Nguyện vọng ghi nhận từ bạn:
                </Typography>
                <Typography variant="body2" sx={{ fontStyle: "italic", color: "#334155", fontSize: "0.75rem", lineHeight: 1.3 }}>
                  "{customWishes}"
                </Typography>
              </Box>

              <Typography variant="caption" sx={{ fontWeight: 700, color: "#0F172A", display: "block", mb: 0.5, fontSize: "0.72rem" }}>
                Giải pháp AI đã tinh chỉnh vào lịch tập:
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.6 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                  <Chip label="Bảo vệ khớp gối" size="small" sx={{ height: 20, fontSize: "0.62rem", bgcolor: "#DCFCE7", color: "#15803D", fontWeight: 700 }} />
                  <Typography variant="caption" sx={{ fontSize: "0.72rem", color: "#475569" }}>
                    Loại bỏ Burpees, Jump Squats; thay bằng bài tập Low-Impact.
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                  <Chip label="Tập trung siết eo" size="small" sx={{ height: 20, fontSize: "0.62rem", bgcolor: "#E0F2FE", color: "#0284C7", fontWeight: 700 }} />
                  <Typography variant="caption" sx={{ fontSize: "0.72rem", color: "#475569" }}>
                    Tập trung bài Standing Abs, Russian Twist chậm, Plank siết rãnh bụng 11.
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                  <Chip label="Thời lượng vừa phải" size="small" sx={{ height: 20, fontSize: "0.62rem", bgcolor: "#FEF3C7", color: "#D97706", fontWeight: 700 }} />
                  <Typography variant="caption" sx={{ fontSize: "0.72rem", color: "#475569" }}>
                    Mỗi buổi kéo dài 30–45 phút, chia nhỏ video để dễ duy trì chuỗi kỷ luật.
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>

          {/* Section 3: 4-Week Milestone Roadmap */}
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2, borderRadius: 2.5, border: "1px solid #E2E8F0", bgcolor: "#FFFFFF" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.2 }}>
                <TimelineIcon sx={{ color: "#0284C7", fontSize: 18 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0F172A", fontSize: "0.85rem" }}>
                  3. Lộ Trình 4 Tuần Tới (Milestone Roadmap)
                </Typography>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ borderLeft: "2.5px solid #10B981", pl: 1.2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: "#059669", fontSize: "0.72rem" }}>
                    Tuần 1 - 2: Kích hoạt cơ lõi sâu (Core Activation)
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748B", display: "block", fontSize: "0.68rem" }}>
                    Hình thành phản xạ gồng bụng tự nhiên khi thở; giảm 0.8–1.2cm eo do thoát nước và siết cơ ngang bụng.
                  </Typography>
                </Box>

                <Box sx={{ borderLeft: "2.5px solid #0284C7", pl: 1.2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: "#0284C7", fontSize: "0.72rem" }}>
                    Tuần 3 - 4: Định hình rãnh eo & Đốt mỡ sâu
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748B", display: "block", fontSize: "0.68rem" }}>
                    Tăng nhịp cardio kháng lực; đo lại vòng 2 đạt mục tiêu giảm 3cm, cơ thể săn chắc rõ rệt.
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>

          {/* Section 4: Golden Recovery Habits */}
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2, borderRadius: 2.5, border: "1px solid #E2E8F0", bgcolor: "#FFFFFF" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.2 }}>
                <LocalDrinkIcon sx={{ color: "#D97706", fontSize: 18 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0F172A", fontSize: "0.85rem" }}>
                  4. Thói Quen Vàng Phục Hồi Cơ Thể
                </Typography>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
                <Box sx={{ bgcolor: "#F8FAFC", p: 1, borderRadius: 1.5, border: "1px solid #EDF2F7" }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.72rem" }}>
                    💧 Uống đủ 2.2L - 2.5L nước mỗi ngày
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748B", display: "block", fontSize: "0.68rem" }}>
                    Nước giúp tăng tốc độ chuyển hóa lipid và hạn chế cảm giác thèm ăn giả tạo.
                  </Typography>
                </Box>

                <Box sx={{ bgcolor: "#F8FAFC", p: 1, borderRadius: 1.5, border: "1px solid #EDF2F7" }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.72rem" }}>
                    🌙 Ngủ đủ 7–8 tiếng và trước 23h
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748B", display: "block", fontSize: "0.68rem" }}>
                    Ngủ sâu giúp hạ nồng độ hormone Cortisol - nguyên nhân chính gây tích trữ mỡ cứng đầu vùng bụng dưới.
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: "#FFFFFF", borderTop: "1px solid #E2E8F0", justifyContent: "space-between" }}>
        <Typography variant="caption" sx={{ color: "#64748B", fontSize: "0.72rem", fontStyle: "italic" }}>
          💡 Dữ liệu được tính toán dựa trên chỉ số BMI {bmi} và hồ sơ của bạn
        </Typography>
        <Button
          onClick={onClose}
          variant="contained"
          color="primary"
          sx={{ borderRadius: 2, fontWeight: 800, px: 3, py: 0.8, fontSize: "0.85rem" }}
        >
          Đã hiểu & Sẵn sàng tập luyện
        </Button>
      </DialogActions>
    </Dialog>
  );
}
