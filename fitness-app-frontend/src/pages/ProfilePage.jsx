import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  Grid,
  TextField,
  Button,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  InputAdornment,
  Chip,
  LinearProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import StraightenIcon from "@mui/icons-material/Straighten";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FemaleIcon from "@mui/icons-material/Female";
import MaleIcon from "@mui/icons-material/Male";
import {
  calculateBMR,
  calculateTDEE,
  calculateBMI,
  ACTIVITY_MULTIPLIERS,
} from "../utils/fitnessCalculators";
import { generateAiWeeklyPlan } from "../data/mockWorkouts";

const DAYS_OF_WEEK = [
  { dayIndex: 1, label: "T2", fullName: "Thứ Hai" },
  { dayIndex: 2, label: "T3", fullName: "Thứ Ba" },
  { dayIndex: 3, label: "T4", fullName: "Thứ Tư" },
  { dayIndex: 4, label: "T5", fullName: "Thứ Năm" },
  { dayIndex: 5, label: "T6", fullName: "Thứ Sáu" },
  { dayIndex: 6, label: "T7", fullName: "Thứ Bảy" },
  { dayIndex: 7, label: "CN", fullName: "Chủ Nhật" },
];

const DURATION_OPTIONS = [
  { id: "15-20", label: "15 - 20 phút", desc: "1 bài chính + khởi động" },
  { id: "30-45", label: "30 - 45 phút (Chuẩn)", desc: "2 bài chính + giãn cơ" },
  { id: "45-60", label: "45 - 60 phút", desc: "Đốt mỡ & siết cơ chuyên sâu" },
];

// 1. Cụm: Hạn chế thể chất & Chấn thương (Physical Limitations)
// Bộ lọc loại trừ (Negative Keywords) để AI tránh gợi ý các động tác gây chấn thương thêm
export const PHYSICAL_LIMITATIONS = [
  // Theo vùng đau / Chấn thương khớp
  { id: "knee_pain", label: "🦵 Đau khớp gối" },
  { id: "lower_back", label: "💆 Đau lưng dưới" },
  { id: "wrist_pain", label: "🖐️ Đau cổ tay" },
  { id: "neck_shoulder", label: "🧣 Đau cổ / Vai gáy" },
  // Theo cường độ & Môi trường
  { id: "no_jumping", label: "🚫 Không nhảy (No Jumping / Low-Impact)" },
  { id: "standing_only", label: "🧍 Bài tập đứng (Standing Only)" },
  { id: "beginner", label: "🌱 Người mới bắt đầu (Beginner)" },
];

// 2. Cụm: Dụng cụ sẵn có (Available Equipment)
// Bộ lọc điều kiện (Attribute Filter) để AI xác định dạng bài tập
export const AVAILABLE_EQUIPMENT = [
  // Cơ bản tại nhà
  { id: "bodyweight", label: "🛋️ Không dụng cụ (Bodyweight)" },
  { id: "yoga_mat", label: "🧘 Thảm Yoga / Thảm tập" },
  // Dụng cụ trợ lực nhẹ
  { id: "resistance_band", label: "🎗️ Dây kháng lực (Mini Band)" },
  { id: "dumbbell", label: "🏋️ Tạ đơn nhỏ (Dumbbells 1–3kg)" },
  { id: "chair_wall", label: "🪑 Ghế tựa / Tường (Chair / Wall)" },
  // Dụng cụ chuyên biệt
  { id: "kettlebell", label: "🔔 Tạ chuông (Kettlebell)" },
  { id: "swiss_ball", label: "⚽ Bóng Yoga (Swiss Ball)" },
];

export default function ProfilePage({
  profile,
  onSaveProfile,
  scheduleConfig,
  onUpdateScheduleConfig,
  setAiPlan,
}) {
  const navigate = useNavigate();

  // Analyzing / Radar scan state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(15);

  // Form State: Profile & Physical measurements
  const [formData, setFormData] = useState({
    name: profile?.name || "Minh Trang",
    gender: profile?.gender || "female",
    age: profile?.age || 24,
    height: profile?.height || 162,
    weight: profile?.weight || 53,
    bust: profile?.bust || 84,
    waist: profile?.waist || 65,
    hips: profile?.hips || 90,
    activityLevel: profile?.activityLevel || "light",
    fitnessGoal: profile?.fitnessGoal || "Tập trung giảm 3cm vòng eo và săn chắc cơ thể",
    customWishes:
      profile?.customWishes ||
      "Mong muốn giảm 3cm vòng eo trước cuối tháng sau, hạn chế các bài nhảy mạnh tránh đau khớp gối.",
  });

  // Schedule Configuration State
  const [currentConfig, setCurrentConfig] = useState({
    selectedDays: scheduleConfig?.selectedDays || [1, 2, 4, 5, 7],
    duration: scheduleConfig?.duration || "30-45",
    limitations: scheduleConfig?.limitations || ["knee_pain", "no_jumping"],
    equipment: scheduleConfig?.equipment || ["bodyweight", "yoga_mat"],
  });

  // Calculations
  const bmr = useMemo(
    () => calculateBMR(formData.weight, formData.height, formData.age, formData.gender),
    [formData.weight, formData.height, formData.age, formData.gender]
  );

  const tdee = useMemo(
    () => calculateTDEE(bmr, formData.activityLevel),
    [bmr, formData.activityLevel]
  );

  const bmi = useMemo(
    () => calculateBMI(formData.weight, formData.height),
    [formData.weight, formData.height]
  );

  const deficitCal = tdee > 0 ? tdee - 350 : 0;

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleDay = (dayIndex) => {
    setCurrentConfig((prev) => {
      const exists = prev.selectedDays.includes(dayIndex);
      if (exists) {
        if (prev.selectedDays.length <= 1) return prev;
        return { ...prev, selectedDays: prev.selectedDays.filter((d) => d !== dayIndex) };
      } else {
        return { ...prev, selectedDays: [...prev.selectedDays, dayIndex].sort() };
      }
    });
  };

  const toggleLimitation = (id) => {
    setCurrentConfig((prev) => {
      const exists = prev.limitations.includes(id);
      return {
        ...prev,
        limitations: exists
          ? prev.limitations.filter((item) => item !== id)
          : [...prev.limitations, id],
      };
    });
  };

  const toggleEquipment = (id) => {
    setCurrentConfig((prev) => {
      const exists = prev.equipment.includes(id);
      return {
        ...prev,
        equipment: exists
          ? prev.equipment.filter((item) => item !== id)
          : [...prev.equipment, id],
      };
    });
  };

  // Start AI Analysis & Navigate to AI Plan Page
  const handleStartAnalysis = (e) => {
    if (e) e.preventDefault();
    setIsAnalyzing(true);
    setAnalysisStep(0);
    setAnalysisProgress(15);
  };

  useEffect(() => {
    if (!isAnalyzing) return;

    const timer1 = setTimeout(() => {
      setAnalysisStep(1);
      setAnalysisProgress(55);
    }, 800);

    const timer2 = setTimeout(() => {
      setAnalysisStep(2);
      setAnalysisProgress(88);
    }, 1600);

    const timer3 = setTimeout(() => {
      setAnalysisProgress(100);
      const allTags = [...currentConfig.limitations, ...currentConfig.equipment];
      const generated = generateAiWeeklyPlan({
        selectedDays: currentConfig.selectedDays,
        duration: currentConfig.duration,
        tags: allTags,
        limitations: currentConfig.limitations,
        equipment: currentConfig.equipment,
        fitnessGoal: formData.fitnessGoal,
        customWishes: formData.customWishes,
      });

      if (onSaveProfile) onSaveProfile(formData);
      if (onUpdateScheduleConfig)
        onUpdateScheduleConfig({
          ...currentConfig,
          tags: allTags,
        });
      if (setAiPlan) setAiPlan(generated);

      setIsAnalyzing(false);
      navigate("/ai-plan");
    }, 2400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isAnalyzing, currentConfig, formData, onSaveProfile, onUpdateScheduleConfig, setAiPlan, navigate]);

  return (
    <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {isAnalyzing ? (
        /* Radar Scanning Loading State */
        <Card
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            p: 4,
            borderRadius: "20px",
            border: "1px solid #E5E7EB",
            bgcolor: "#FFFFFF",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
            textAlign: "center",
          }}
        >
          {/* Radar Ring Animation */}
          <Box
            sx={{
              position: "relative",
              width: 140,
              height: 140,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 3,
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: "2px solid #10B981",
                opacity: 0.25,
                animation: "ripple 2s infinite cubic-bezier(0, 0.2, 0.8, 1)",
                "@keyframes ripple": {
                  "0%": { transform: "scale(0.8)", opacity: 0.8 },
                  "100%": { transform: "scale(1.7)", opacity: 0 },
                },
              }}
            />
            <Box
              sx={{
                width: 76,
                height: 76,
                borderRadius: "50%",
                bgcolor: "#ECFDF5",
                border: "2px solid #10B981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 25px rgba(16, 185, 129, 0.4)",
                animation: "pulse 1.5s infinite ease-in-out",
                "@keyframes pulse": {
                  "0%, 100%": { transform: "scale(1)" },
                  "50%": { transform: "scale(1.06)" },
                },
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 36, color: "#10B981" }} />
            </Box>
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 850, color: "#0F172A", mb: 1 }}>
            AI Đang Thiết Kế Giáo Án Tuần Chuẩn Xác
          </Typography>

          <Box sx={{ height: 28, mb: 3 }}>
            {analysisStep === 0 && (
              <Typography variant="body2" sx={{ color: "#059669", fontWeight: 700, fontSize: "0.95rem" }}>
                ⚡ Bước 1/3: Đang tính toán BMR & TDEE theo thể trạng...
              </Typography>
            )}
            {analysisStep === 1 && (
              <Typography variant="body2" sx={{ color: "#0284C7", fontWeight: 700, fontSize: "0.95rem" }}>
                🎯 Bước 2/3: Lọc danh sách video: "Low-impact, bảo vệ khớp gối, không nhảy"...
              </Typography>
            )}
            {analysisStep >= 2 && (
              <Typography variant="body2" sx={{ color: "#D97706", fontWeight: 700, fontSize: "0.95rem" }}>
                ✨ Bước 3/3: Tối ưu cấu trúc 3 clip/buổi & Lộ trình 7 ngày tập luyện...
              </Typography>
            )}
          </Box>

          <Box sx={{ width: "100%", maxWidth: 360 }}>
            <LinearProgress
              variant="determinate"
              value={analysisProgress}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: "#F1F5F9",
                "& .MuiLinearProgress-bar": {
                  bgcolor: "#10B981",
                  borderRadius: 4,
                  transition: "transform 0.4s ease",
                },
              }}
            />
            <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600, mt: 1, display: "block" }}>
              Xử lý dữ liệu đa nguồn từ các HLV thể hình uy tín... {analysisProgress}%
            </Typography>
          </Box>
        </Card>
      ) : (
        /* Input Form Screen */
        <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", overflowY: "auto", pr: 0.5, gap: 1.5 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
              gap: 1.5,
              flex: 1,
            }}
          >
            {/* ------------------------------------------------------------- */}
            {/* CARD 1: Chỉ số thể chất & Mục tiêu (Profile Data)              */}
            {/* ------------------------------------------------------------- */}
            <Card
              sx={{
                p: 2,
                borderRadius: "16px",
                border: "1px solid #E5E7EB",
                bgcolor: "#FFFFFF",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
                display: "flex",
                flexDirection: "column",
                gap: 1.6,
              }}
            >
              {/* Section 1: Basic Information */}
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                    <PersonIcon sx={{ color: "#64748B", fontSize: 18 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0F172A", fontSize: "0.85rem" }}>
                      Thông tin thể chất cơ bản
                    </Typography>
                  </Box>
                  <Chip
                    label="Tài khoản cá nhân"
                    size="small"
                    sx={{ height: 18, fontSize: "0.6rem", fontWeight: 700, bgcolor: "#F1F5F9", color: "#64748B" }}
                  />
                </Box>

                <Grid container spacing={1}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth size="small" label="Họ và tên" name="name" value={formData.name} onChange={handleChange} />
                  </Grid>

                  <Grid item xs={4} sm={2}>
                    <TextField fullWidth size="small" label="Giới tính" value={formData.gender === "female" ? "Nữ" : "Nam"} disabled />
                  </Grid>

                  <Grid item xs={4} sm={2}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Tuổi"
                      name="age"
                      type="number"
                      value={formData.age}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={4} sm={2}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Chiều cao"
                      name="height"
                      type="number"
                      value={formData.height}
                      onChange={handleChange}
                      InputProps={{ endAdornment: <InputAdornment position="end">cm</InputAdornment> }}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Section 2: Measurements */}
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 1 }}>
                  <StraightenIcon sx={{ color: "#16A34A", fontSize: 18 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0F172A", fontSize: "0.85rem" }}>
                    Cân nặng & Số đo 3 vòng
                  </Typography>
                </Box>

                <Grid container spacing={1}>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Cân nặng"
                      name="weight"
                      type="number"
                      value={formData.weight}
                      onChange={handleChange}
                      InputProps={{ endAdornment: <InputAdornment position="end">kg</InputAdornment> }}
                    />
                  </Grid>

                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Vòng 1 (Ngực)"
                      name="bust"
                      type="number"
                      value={formData.bust}
                      onChange={handleChange}
                      InputProps={{ endAdornment: <InputAdornment position="end">cm</InputAdornment> }}
                    />
                  </Grid>

                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Vòng 2 (Eo)"
                      name="waist"
                      type="number"
                      value={formData.waist}
                      onChange={handleChange}
                      InputProps={{ endAdornment: <InputAdornment position="end">cm</InputAdornment> }}
                    />
                  </Grid>

                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Vòng 3 (Mông)"
                      name="hips"
                      type="number"
                      value={formData.hips}
                      onChange={handleChange}
                      InputProps={{ endAdornment: <InputAdornment position="end">cm</InputAdornment> }}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Section 3: Activity Level */}
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 1 }}>
                  <DirectionsRunIcon sx={{ color: "#D97706", fontSize: 18 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0F172A", fontSize: "0.85rem" }}>
                    Mức độ vận động hàng ngày
                  </Typography>
                </Box>

                <FormControl fullWidth size="small">
                  <InputLabel>Mức độ vận động</InputLabel>
                  <Select
                    name="activityLevel"
                    value={formData.activityLevel}
                    label="Mức độ vận động"
                    onChange={handleChange}
                  >
                    {Object.entries(ACTIVITY_MULTIPLIERS).map(([key, item]) => (
                      <MenuItem key={key} value={key}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", pr: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.label}</Typography>
                          <Typography variant="caption" color="text.secondary">{item.desc}</Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Section 4: Notes for AI */}
              <Box>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  label="Ghi chú nguyện vọng riêng cho AI Coach"
                  name="customWishes"
                  value={formData.customWishes}
                  onChange={handleChange}
                  placeholder="Ví dụ: Giảm 3cm eo trước đám cưới tháng sau; khớp gối yếu tránh nhảy cao; bài tập dưới 30 phút..."
                  helperText="AI sẽ ưu tiên lọc các video YouTube chuẩn xác theo đúng mong muốn của bạn."
                  FormHelperTextProps={{ style: { fontSize: "0.65rem", marginTop: 2, color: "#64748B" } }}
                />
              </Box>
            </Card>

            {/* ------------------------------------------------------------- */}
            {/* CARD 2: Cấu hình lịch tập & Ràng buộc YouTube                  */}
            {/* ------------------------------------------------------------- */}
            <Card
              sx={{
                p: 2,
                borderRadius: "16px",
                border: "1px solid #E5E7EB",
                bgcolor: "#FFFFFF",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
                display: "flex",
                flexDirection: "column",
                gap: 1.8,
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                  <CalendarMonthIcon sx={{ color: "#16A34A", fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0F172A", fontSize: "0.92rem" }}>
                    Cấu hình Lịch tập & Ràng buộc AI
                  </Typography>
                </Box>
                <Chip
                  label="Flow 3 Clip Chuẩn Y Khoa"
                  size="small"
                  sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700, bgcolor: "#ECFDF5", color: "#059669" }}
                />
              </Box>

              {/* 1. Chọn ngày tập trong tuần: 7 Chip tròn toggle */}
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.8 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: "#334155", fontSize: "0.75rem", textTransform: "uppercase" }}>
                    1. Ngày tập trong tuần
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "#16A34A", fontSize: "0.72rem" }}>
                    {currentConfig.selectedDays.length} ngày tập • {7 - currentConfig.selectedDays.length} ngày nghỉ
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 1, justifyContent: "space-between" }}>
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = currentConfig.selectedDays.includes(day.dayIndex);
                    return (
                      <Box
                        key={day.dayIndex}
                        onClick={() => toggleDay(day.dayIndex)}
                        sx={{
                          flex: 1,
                          height: 48,
                          borderRadius: 3,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          transition: "all 0.18s ease",
                          bgcolor: isSelected ? "#10B981" : "#F8FAFC",
                          color: isSelected ? "#FFFFFF" : "#64748B",
                          border: isSelected ? "1.5px solid #059669" : "1px dashed #CBD5E1",
                          boxShadow: isSelected ? "0 4px 10px rgba(16, 185, 129, 0.3)" : "none",
                          "&:hover": {
                            transform: "translateY(-1px)",
                            borderColor: "#10B981",
                          },
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 800, fontSize: "0.85rem", lineHeight: 1.1 }}>
                          {day.label}
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: "0.55rem", opacity: isSelected ? 0.95 : 0.7, fontWeight: 600 }}>
                          {isSelected ? "Tập" : "Nghỉ"}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>

              {/* 2. Thời lượng tập mỗi buổi */}
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.8 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: "#334155", fontSize: "0.75rem", textTransform: "uppercase" }}>
                    2. Thời lượng mỗi buổi tập
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                    <AccessTimeIcon sx={{ fontSize: 13, color: "#64748B" }} />
                    <Typography variant="caption" sx={{ color: "#64748B", fontSize: "0.68rem" }}>
                      Khởi động + Bài chính + Giãn cơ
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
                  {DURATION_OPTIONS.map((opt) => {
                    const isSelected = currentConfig.duration === opt.id;
                    return (
                      <Box
                        key={opt.id}
                        onClick={() => setCurrentConfig((prev) => ({ ...prev, duration: opt.id }))}
                        sx={{
                          p: 1,
                          borderRadius: 2.5,
                          cursor: "pointer",
                          textAlign: "center",
                          border: isSelected ? "1.5px solid #10B981" : "1px solid #E2E8F0",
                          bgcolor: isSelected ? "#ECFDF5" : "#FFFFFF",
                          transition: "all 0.15s ease",
                          "&:hover": { borderColor: "#10B981" },
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 800, color: isSelected ? "#059669" : "#0F172A", fontSize: "0.82rem" }}>
                          {opt.label}
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: "0.62rem", color: "#64748B", display: "block" }}>
                          {opt.desc}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>

              {/* 3. Cụm: Hạn chế thể chất & Chấn thương (Physical Limitations) */}
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.8 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: "#334155", fontSize: "0.75rem", textTransform: "uppercase" }}>
                    3. Hạn chế thể chất & Chấn thương
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#E11D48", fontWeight: 700, fontSize: "0.68rem" }}>
                    Bộ lọc loại trừ (Negative Keywords)
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
                  {PHYSICAL_LIMITATIONS.map((tag) => {
                    const isSelected = currentConfig.limitations.includes(tag.id);
                    return (
                      <Chip
                        key={tag.id}
                        label={tag.label}
                        clickable
                        onClick={() => toggleLimitation(tag.id)}
                        sx={{
                          borderRadius: "10px",
                          fontWeight: isSelected ? 800 : 500,
                          fontSize: "0.72rem",
                          bgcolor: isSelected ? "#FEE2E2" : "#F8FAFC",
                          color: isSelected ? "#BE123C" : "#334155",
                          border: isSelected ? "1.5px solid #F43F5E" : "1px solid #E2E8F0",
                          transition: "all 0.15s ease",
                          "&:hover": {
                            bgcolor: isSelected ? "#FECDD3" : "#F1F5F9",
                          },
                        }}
                      />
                    );
                  })}
                </Box>
              </Box>

              {/* 4. Cụm: Dụng cụ sẵn có (Available Equipment) */}
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.8 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: "#334155", fontSize: "0.75rem", textTransform: "uppercase" }}>
                    4. Dụng cụ sẵn có
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#2563EB", fontWeight: 700, fontSize: "0.68rem" }}>
                    Bộ lọc điều kiện (Attribute Filter)
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
                  {AVAILABLE_EQUIPMENT.map((tag) => {
                    const isSelected = currentConfig.equipment.includes(tag.id);
                    return (
                      <Chip
                        key={tag.id}
                        label={tag.label}
                        clickable
                        onClick={() => toggleEquipment(tag.id)}
                        sx={{
                          borderRadius: "10px",
                          fontWeight: isSelected ? 800 : 500,
                          fontSize: "0.72rem",
                          bgcolor: isSelected ? "#EFF6FF" : "#F8FAFC",
                          color: isSelected ? "#1D4ED8" : "#334155",
                          border: isSelected ? "1.5px solid #3B82F6" : "1px solid #E2E8F0",
                          transition: "all 0.15s ease",
                          "&:hover": {
                            bgcolor: isSelected ? "#DBEAFE" : "#F1F5F9",
                          },
                        }}
                      />
                    );
                  })}
                </Box>
              </Box>
            </Card>
          </Box>

          {/* Sticky Bottom CTA Bar */}
          <Box
            sx={{
              position: "sticky",
              bottom: 0,
              p: 1.5,
              borderRadius: "16px",
              bgcolor: "#FFFFFF",
              border: "1px solid #E5E7EB",
              boxShadow: "0 -2px 12px rgba(0, 0, 0, 0.04)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexShrink: 0,
              zIndex: 10,
              flexWrap: "wrap",
              gap: 1.5,
            }}
          >
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 850, color: "#0F172A", fontSize: "0.9rem" }}>
                {currentConfig.selectedDays.length} ngày tập • {currentConfig.duration}p/buổi
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748B", fontSize: "0.72rem" }}>
                {currentConfig.limitations.length} hạn chế thể chất • {currentConfig.equipment.length} dụng cụ sẵn có
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                onClick={() => navigate("/ai-plan")}
                variant="outlined"
                color="inherit"
                sx={{
                  borderRadius: "12px",
                  fontWeight: 750,
                  fontSize: "0.85rem",
                  px: 2,
                }}
              >
                Xem Kế Hoạch AI Đang Có
              </Button>

              <Button
                onClick={handleStartAnalysis}
                variant="contained"
                color="primary"
                size="large"
                startIcon={<AutoAwesomeIcon sx={{ fontSize: 20 }} />}
                sx={{
                  px: 3.5,
                  py: 1.2,
                  borderRadius: "12px",
                  fontSize: "0.95rem",
                  fontWeight: 850,
                  background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                  boxShadow: "0 4px 15px rgba(16, 185, 129, 0.35)",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                    transform: "translateY(-1px)",
                    boxShadow: "0 6px 20px rgba(16, 185, 129, 0.45)",
                  },
                }}
              >
                Tạo Lịch Tập Thông Minh Với AI
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}
