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
  Tooltip,
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
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SpeedIcon from "@mui/icons-material/Speed";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
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

// 1. Mục tiêu tập luyện chính (Primary Fitness Goal - Chọn duy nhất 1)
export const FITNESS_GOALS = [
  { id: "fat_loss", label: "Giảm mỡ & Thu nhỏ eo", icon: "🔥", desc: "Đốt mỡ, thon gọn" },
  { id: "muscle_gain", label: "Tăng khối lượng cơ", icon: "💪", desc: "Săn chắc & nở nang" },
  { id: "strength", label: "Phát triển sức mạnh", icon: "🏋️", desc: "Tăng lực cơ bắp" },
  { id: "endurance", label: "Nâng cao sức bền", icon: "🏃", desc: "Tim mạch & dẻo dai" },
  { id: "general_fitness", label: "Thể lực & Khỏe mạnh", icon: "⚡", desc: "Năng động mỗi ngày" },
  { id: "flexibility", label: "Linh hoạt & Dẻo dai", icon: "🧘", desc: "Kéo giãn & phục hồi" },
];

// 2. Kinh nghiệm tập luyện (Training Experience)
export const EXPERIENCE_LEVELS = [
  { id: "beginner", label: "Mới bắt đầu", desc: "< 6 tháng" },
  { id: "intermediate", label: "Có kinh nghiệm", desc: "6 tháng - 2 năm" },
  { id: "advanced", label: "Nâng cao", desc: "> 2 năm" },
];

// 3. Thể loại bài tập yêu thích (Workout Preferences - Tối đa 3)
export const WORKOUT_PREFERENCES = [
  { id: "strength", label: "🏋️ Sức mạnh", desc: "Kháng lực / Tạ" },
  { id: "cardio", label: "🏃 Cardio", desc: "Đốt mỡ toàn thân" },
  { id: "yoga", label: "🧘 Yoga", desc: "Thăng bằng & dẻo dai" },
  { id: "pilates", label: "🤸 Pilates", desc: "Siết eo & cơ cốt lõi" },
  { id: "mobility", label: "🧘‍♂️ Giãn cơ", desc: "Phục hồi khớp" },
  { id: "hiit", label: "⚡ HIIT", desc: "Cường độ cao" },
];

// 4. Cụm: Hạn chế thể chất & Chấn thương (Physical Limitations)
// Bộ lọc loại trừ (Negative Keywords) - Đã tách "Beginner" sang mục Kinh nghiệm riêng biệt
export const PHYSICAL_LIMITATIONS = [
  { id: "knee_pain", label: "Đau khớp gối" },
  { id: "lower_back", label: "Đau lưng dưới" },
  { id: "wrist_pain", label: "Đau cổ tay" },
  { id: "neck_shoulder", label: "Đau cổ / Vai gáy" },
  { id: "no_jumping", label: "Không nhảy" },
  { id: "standing_only", label: "Bài tập đứng" },
];

// 5. Cụm: Dụng cụ sẵn có (Available Equipment)
// Bộ lọc điều kiện (Attribute Filter) để AI xác định dạng bài tập
export const AVAILABLE_EQUIPMENT = [
  { id: "bodyweight", label: "Không dụng cụ" },
  { id: "dumbbell", label: "Tạ đơn" },
  { id: "barbell", label: "Tạ đòn" },
  { id: "resistance_band", label: "Dây kháng lực" },
  { id: "cable_machine", label: "Máy cáp" },
  { id: "machine", label: "Máy tập" },
  { id: "smith_machine", label: "Máy Smith" },
  { id: "trx", label: "TRX" },
];

export default function ProfilePage({
  profile,
  onSaveProfile,
  scheduleConfig,
  onUpdateScheduleConfig,
  setAiPlan,
  needsOnboarding = false,
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
    fitnessGoal: profile?.fitnessGoal || "fat_loss",
    experience: profile?.experience || "beginner",
    workoutPreferences: profile?.workoutPreferences || ["cardio", "pilates"],
    customWishes:
      profile?.customWishes ||
      "Mong muốn giảm 3cm vòng eo trước cuối tháng sau, hạn chế các bài nhảy mạnh tránh đau khớp gối.",
  });

  // Schedule Configuration State
  const [currentConfig, setCurrentConfig] = useState({
    selectedDays: scheduleConfig?.selectedDays || [1, 2, 4, 5, 7],
    duration: scheduleConfig?.duration || "30-45",
    limitations: scheduleConfig?.limitations || ["knee_pain", "no_jumping"],
    equipment: scheduleConfig?.equipment || ["bodyweight"],
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

  const handleGoalSelect = (goalId) => {
    setFormData((prev) => ({ ...prev, fitnessGoal: goalId }));
  };

  const handleExperienceSelect = (expId) => {
    setFormData((prev) => ({ ...prev, experience: expId }));
  };

  const toggleWorkoutPreference = (prefId) => {
    setFormData((prev) => {
      const current = prev.workoutPreferences || [];
      if (current.includes(prefId)) {
        if (current.length <= 1) return prev; // Keep at least 1
        return {
          ...prev,
          workoutPreferences: current.filter((id) => id !== prefId),
        };
      } else {
        if (current.length >= 3) {
          // Maximum 3 selections reached
          return prev;
        }
        return {
          ...prev,
          workoutPreferences: [...current, prefId],
        };
      }
    });
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
    if (e && e.preventDefault) e.preventDefault();
    setIsAnalyzing(true);
    setAnalysisStep(0);
    setAnalysisProgress(20);
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
      const selectedGoalObj = FITNESS_GOALS.find((g) => g.id === formData.fitnessGoal);
      const goalText = selectedGoalObj ? selectedGoalObj.label : formData.fitnessGoal;

      const generated = generateAiWeeklyPlan({
        selectedDays: currentConfig.selectedDays,
        duration: currentConfig.duration,
        tags: allTags,
        limitations: currentConfig.limitations,
        equipment: currentConfig.equipment,
        fitnessGoal: goalText,
        customWishes: formData.customWishes,
      });

      if (onSaveProfile) onSaveProfile(formData, currentConfig);
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

  const selectedGoalName = useMemo(() => {
    const found = FITNESS_GOALS.find((g) => g.id === formData.fitnessGoal);
    return found ? found.label : "Giảm mỡ";
  }, [formData.fitnessGoal]);

  const selectedExpName = useMemo(() => {
    const found = EXPERIENCE_LEVELS.find((e) => e.id === formData.experience);
    return found ? found.label : "Người mới";
  }, [formData.experience]);

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
                  "100%": { transform: "scale(1.4)", opacity: 0 },
                },
              }}
            />
            <Box
              sx={{
                width: 90,
                height: 90,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                boxShadow: "0 8px 25px rgba(16, 185, 129, 0.4)",
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 44 }} />
            </Box>
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 850, color: "#0F172A", mb: 1 }}>
            AI Gemini Đang Xây Dựng Giáo Án Thích Ứng
          </Typography>

          <Typography variant="body2" sx={{ color: "#64748B", maxWidth: 460, mb: 3 }}>
            {analysisStep === 0 && "Bước 1: Tính toán mục tiêu và phân tích thể trạng..."}
            {analysisStep === 1 && "Bước 2: Sàng lọc bài tập phù hợp thể trạng, hạn chế rủi ro chấn thương..."}
            {analysisStep === 2 && "Bước 3: Tối ưu 7 ngày tập luyện theo cấu hình của bạn..."}
          </Typography>

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
          {needsOnboarding && (
            <Card
              sx={{
                p: 2,
                borderRadius: "16px",
                bgcolor: "#F0FDF4",
                border: "1.5px solid #86EFAC",
                boxShadow: "0 4px 15px rgba(22, 163, 74, 0.08)",
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexShrink: 0,
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "12px",
                  bgcolor: "#DCFCE7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#16A34A",
                  flexShrink: 0,
                }}
              >
                <AutoAwesomeIcon />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#166534" }}>
                  Bước thiết lập bắt buộc: Khởi tạo hồ sơ thể chất ban đầu 🎯
                </Typography>
                <Typography variant="body2" sx={{ color: "#15803D", fontSize: "0.85rem" }}>
                  Để AI Coach Gemini có thể tính toán chính xác chỉ số BMR/TDEE và đề xuất giáo án 7 ngày thích ứng, bạn cần hoàn tất số đo cơ thể và các hạn chế chấn thương bên dưới.
                </Typography>
              </Box>
            </Card>
          )}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
              gap: 1.5,
              flex: 1,
            }}
          >
            {/* ------------------------------------------------------------- */}
            {/* CARD 1 (LEFT COLUMN): Hồ Sơ Thể Lực & Mục Tiêu Cá Nhân        */}
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
                gap: 1.5,
              }}
            >
              {/* 1. Basic Information */}
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.8 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                    <PersonIcon sx={{ color: "#16A34A", fontSize: 18 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0F172A", fontSize: "0.85rem" }}>
                      1. Thông tin cơ bản
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

                  <Grid item xs={6} sm={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Giới tính</InputLabel>
                      <Select
                        name="gender"
                        value={formData.gender}
                        label="Giới tính"
                        onChange={handleChange}
                      >
                        <MenuItem value="female">Nữ</MenuItem>
                        <MenuItem value="male">Nam</MenuItem>
                        <MenuItem value="other">Khác</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={6} sm={3}>
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
                </Grid>
              </Box>

              {/* 2. Primary Fitness Goal (Compact Selectable Cards - 6 Options, Single Choice) */}
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.8 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                    <EmojiEventsIcon sx={{ color: "#F59E0B", fontSize: 18 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0F172A", fontSize: "0.85rem" }}>
                      2. Mục tiêu tập luyện
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: "#059669", fontWeight: 750, fontSize: "0.68rem" }}>
                    Chỉ chọn 1 mục tiêu
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)" },
                    gap: 0.8,
                  }}
                >
                  {FITNESS_GOALS.map((goal) => {
                    const isSelected = formData.fitnessGoal === goal.id;
                    return (
                      <Box
                        key={goal.id}
                        onClick={() => handleGoalSelect(goal.id)}
                        sx={{
                          p: "0.55rem 0.65rem",
                          borderRadius: "10px",
                          border: isSelected ? "1.8px solid #16A34A" : "1px solid #E2E8F0",
                          bgcolor: isSelected ? "#F0FDF4" : "#F8FAFC",
                          boxShadow: isSelected ? "0 2px 8px rgba(22, 163, 74, 0.15)" : "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 0.8,
                          transition: "all 0.15s ease",
                          "&:hover": {
                            bgcolor: isSelected ? "#DCFCE7" : "#F1F5F9",
                            borderColor: isSelected ? "#15803D" : "#CBD5E1",
                          },
                        }}
                      >
                        <Box sx={{ fontSize: "1.1rem", lineHeight: 1 }}>{goal.icon}</Box>
                        <Box sx={{ overflow: "hidden", minWidth: 0 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: isSelected ? 800 : 650,
                              color: isSelected ? "#15803D" : "#1E293B",
                              fontSize: "0.75rem",
                              lineHeight: 1.2,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {goal.label}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: isSelected ? "#16A34A" : "#64748B",
                              fontSize: "0.65rem",
                              display: "block",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {goal.desc}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>

              {/* 3. Training Experience & Workout Preferences */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {/* 3A: Training Experience (Segmented Buttons) */}
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.6 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                      <SpeedIcon sx={{ color: "#3B82F6", fontSize: 17 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0F172A", fontSize: "0.82rem" }}>
                        3A. Kinh nghiệm tập luyện
                      </Typography>
                    </Box>
                  </Box>

                  {/* Segmented Button Group */}
                  <Box
                    sx={{
                      display: "flex",
                      bgcolor: "#F1F5F9",
                      borderRadius: "10px",
                      p: "3px",
                      gap: "3px",
                    }}
                  >
                    {EXPERIENCE_LEVELS.map((exp) => {
                      const isSelected = formData.experience === exp.id;
                      return (
                        <Box
                          key={exp.id}
                          onClick={() => handleExperienceSelect(exp.id)}
                          sx={{
                            flex: 1,
                            py: 0.7,
                            px: 1,
                            textAlign: "center",
                            borderRadius: "8px",
                            cursor: "pointer",
                            bgcolor: isSelected ? "#FFFFFF" : "transparent",
                            boxShadow: isSelected ? "0 2px 6px rgba(0, 0, 0, 0.08)" : "none",
                            color: isSelected ? "#15803D" : "#64748B",
                            fontWeight: isSelected ? 800 : 600,
                            fontSize: "0.75rem",
                            transition: "all 0.15s ease",
                            "&:hover": {
                              color: isSelected ? "#15803D" : "#1F2937",
                            },
                          }}
                        >
                          {exp.label}
                          <Typography
                            component="span"
                            sx={{
                              display: { xs: "none", sm: "inline" },
                              fontSize: "0.65rem",
                              color: isSelected ? "#16A34A" : "#94A3B8",
                              ml: 0.5,
                              fontWeight: 500,
                            }}
                          >
                            ({exp.desc})
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>

                {/* 3B: Workout Preferences (Compact Chips - Max 3) */}
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.6 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                      <FitnessCenterIcon sx={{ color: "#6366F1", fontSize: 17 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0F172A", fontSize: "0.82rem" }}>
                        3B. Thể loại bài tập ưu tiên
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: "#4F46E5", fontWeight: 700, fontSize: "0.68rem" }}>
                      Đã chọn ({formData.workoutPreferences?.length || 0}/3)
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6 }}>
                    {WORKOUT_PREFERENCES.map((pref) => {
                      const isSelected = formData.workoutPreferences?.includes(pref.id);
                      const isMaxReached = (formData.workoutPreferences?.length || 0) >= 3 && !isSelected;

                      return (
                        <Tooltip
                          key={pref.id}
                          title={isMaxReached ? "Đã chọn tối đa 3 thể loại" : pref.desc}
                          arrow
                        >
                          <span>
                            <Chip
                              label={pref.label}
                              clickable={!isMaxReached}
                              onClick={() => toggleWorkoutPreference(pref.id)}
                              sx={{
                                borderRadius: "8px",
                                fontWeight: isSelected ? 800 : 500,
                                fontSize: "0.72rem",
                                height: 26,
                                bgcolor: isSelected ? "#EEF2FF" : "#F8FAFC",
                                color: isSelected ? "#4338CA" : isMaxReached ? "#94A3B8" : "#334155",
                                border: isSelected ? "1.5px solid #6366F1" : "1px solid #E2E8F0",
                                opacity: isMaxReached ? 0.6 : 1,
                                transition: "all 0.15s ease",
                                "&:hover": {
                                  bgcolor: isSelected ? "#E0E7FF" : isMaxReached ? "#F8FAFC" : "#F1F5F9",
                                },
                              }}
                            />
                          </span>
                        </Tooltip>
                      );
                    })}
                  </Box>
                </Box>
              </Box>

              {/* 4. Body Measurements */}
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.8 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                    <StraightenIcon sx={{ color: "#16A34A", fontSize: 18 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0F172A", fontSize: "0.85rem" }}>
                      4. Chỉ số cơ thể
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 0.6 }}>
                    <Chip
                      label={`BMI: ${Number(bmi || 0).toFixed(1)}`}
                      size="small"
                      sx={{ height: 18, fontSize: "0.62rem", fontWeight: 800, bgcolor: "#ECFDF5", color: "#059669" }}
                    />
                    <Chip
                      label={`TDEE: ~${tdee} kcal`}
                      size="small"
                      sx={{ height: 18, fontSize: "0.62rem", fontWeight: 800, bgcolor: "#EFF6FF", color: "#2563EB" }}
                    />
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(5, 1fr)" },
                    gap: 1,
                  }}
                >
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
                </Box>
              </Box>

              {/* 5. Activity Level */}
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 0.6 }}>
                  <DirectionsRunIcon sx={{ color: "#D97706", fontSize: 18 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0F172A", fontSize: "0.85rem" }}>
                    5. Mức độ vận động hàng ngày
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
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.8rem" }}>{item.label}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem" }}>{item.desc}</Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Card>

            {/* ------------------------------------------------------------- */}
            {/* CARD 2 (RIGHT COLUMN): Cấu Hình Lịch Tập & Ràng Buộc AI       */}
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
                gap: 1.5,
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                  <CalendarMonthIcon sx={{ color: "#16A34A", fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0F172A", fontSize: "0.92rem" }}>
                    Cấu hình Lịch tập & Ràng buộc AI
                  </Typography>
                </Box>

              </Box>

              {/* 1. Chọn ngày tập trong tuần: 7 Chip tròn toggle */}
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.8 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: "#334155", fontSize: "0.75rem", textTransform: "uppercase" }}>
                    1. Ngày tập trong tuần
                  </Typography>

                </Box>

                <Box sx={{ display: "flex", gap: 1, justifyContent: "space-between" }}>
                  {DAYS_OF_WEEK.map((d) => {
                    const isSelected = currentConfig.selectedDays.includes(d.dayIndex);
                    return (
                      <Box
                        key={d.dayIndex}
                        onClick={() => toggleDay(d.dayIndex)}
                        sx={{
                          flex: 1,
                          py: 1,
                          borderRadius: "12px",
                          border: isSelected ? "1.5px solid #16A34A" : "1px solid #E2E8F0",
                          bgcolor: isSelected ? "#16A34A" : "#F8FAFC",
                          color: isSelected ? "#FFFFFF" : "#64748B",
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.15s ease",
                          boxShadow: isSelected ? "0 4px 10px rgba(22, 163, 74, 0.25)" : "none",
                          "&:hover": {
                            bgcolor: isSelected ? "#15803D" : "#F1F5F9",
                            transform: "translateY(-1px)",
                          },
                        }}
                      >
                        <Typography sx={{ fontWeight: 800, fontSize: "0.85rem", lineHeight: 1.1 }}>
                          {d.label}
                        </Typography>
                        <Typography sx={{ fontSize: "0.6rem", opacity: isSelected ? 0.9 : 0.6, mt: 0.2 }}>
                          {isSelected ? "Tập" : "Nghỉ"}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>

              {/* 2. Chọn thời lượng mỗi buổi tập */}
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.8 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: "#334155", fontSize: "0.75rem", textTransform: "uppercase" }}>
                    2. Thời lượng mỗi buổi tập
                  </Typography>
                  <AccessTimeIcon sx={{ color: "#64748B", fontSize: 16 }} />
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
                  {DURATION_OPTIONS.map((opt) => {
                    const isSelected = currentConfig.duration === opt.id;
                    return (
                      <Box
                        key={opt.id}
                        onClick={() => setCurrentConfig((prev) => ({ ...prev, duration: opt.id }))}
                        sx={{
                          p: 1.2,
                          borderRadius: "12px",
                          border: isSelected ? "1.5px solid #16A34A" : "1px solid #E2E8F0",
                          bgcolor: isSelected ? "#F0FDF4" : "#F8FAFC",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          "&:hover": {
                            bgcolor: isSelected ? "#DCFCE7" : "#F1F5F9",
                          },
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: isSelected ? 800 : 600, color: isSelected ? "#15803D" : "#1F2937", fontSize: "0.8rem" }}>
                          {opt.label}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#64748B", fontSize: "0.68rem", display: "block" }}>
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
                          bgcolor: isSelected ? "#FFE4E6" : "#F8FAFC",
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

              {/* 5. Ghi chú & Nguyện vọng riêng cho AI Coach */}
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.8 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: "#334155", fontSize: "0.75rem", textTransform: "uppercase" }}>
                    5. Ghi chú & Nguyện vọng riêng cho AI Coach
                  </Typography>

                </Box>

                <TextField
                  fullWidth
                  size="small"
                  multiline
                  rows={2.5}
                  name="customWishes"
                  value={formData.customWishes}
                  onChange={handleChange}
                  placeholder="Ví dụ: Giảm 3cm eo trước đám cưới tháng sau; khớp gối yếu tránh nhảy cao; ưu tiên bài tập dưới 30 phút..."

                  FormHelperTextProps={{ style: { fontSize: "0.65rem", marginTop: 2, color: "#64748B" } }}
                />
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
                {currentConfig.selectedDays.length} ngày tập • {currentConfig.duration}p/buổi • Mục tiêu: {selectedGoalName}
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748B", fontSize: "0.72rem" }}>
                Kinh nghiệm: {selectedExpName} • {currentConfig.limitations.length} hạn chế thể chất • {currentConfig.equipment.length} dụng cụ sẵn có
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
