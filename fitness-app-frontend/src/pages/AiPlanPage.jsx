import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  Grid,
  Button,
  Chip,
  LinearProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SelfImprovementIcon from "@mui/icons-material/SelfImprovement";
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";
import { generateAiWeeklyPlan, getWorkoutDayMeta } from "../data/mockWorkouts";

export default function AiPlanPage({
  profile,
  scheduleConfig,
  aiPlan,
  setAiPlan,
  onApplySchedule,
}) {
  const navigate = useNavigate();

  // Current plan fallback
  const plan = useMemo(() => {
    if (aiPlan && aiPlan.length > 0) return aiPlan;
    const allTags = [
      ...(scheduleConfig?.limitations || ["knee_pain", "no_jumping"]),
      ...(scheduleConfig?.equipment || ["bodyweight", "yoga_mat"]),
    ];
    return generateAiWeeklyPlan({
      selectedDays: scheduleConfig?.selectedDays || [1, 2, 4, 5, 7],
      duration: scheduleConfig?.duration || "30-45",
      tags: allTags,
      limitations: scheduleConfig?.limitations || ["knee_pain", "no_jumping"],
      equipment: scheduleConfig?.equipment || ["bodyweight", "yoga_mat"],
      fitnessGoal: profile?.fitnessGoal || "Tập trung giảm 3cm vòng eo và săn chắc cơ thể",
      customWishes: profile?.customWishes || "Mong muốn giảm 3cm vòng eo, hạn chế nhảy mạnh tránh đau khớp gối.",
    });
  }, [aiPlan, scheduleConfig, profile]);

  const [selectedDayIndex, setSelectedDayIndex] = useState(2); // Default preview Tuesday (T3)
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(15);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Workout Goal & Level Info (app không làm nutrition, tập trung rèn luyện)
  const goalLabel = profile?.fitnessGoal === "fat_loss" || !profile?.fitnessGoal
    ? "Giảm vòng eo"
    : (
      profile?.fitnessGoal === "muscle_gain" ? "Tăng cơ & Săn chắc" :
      profile?.fitnessGoal === "strength" ? "Phát triển sức mạnh" :
      profile?.fitnessGoal === "endurance" ? "Nâng cao sức bền" :
      profile?.fitnessGoal === "flexibility" ? "Dẻo dai & Linh hoạt" :
      profile?.fitnessGoal
    );

  const experienceLabel = profile?.experience === "intermediate"
    ? "Intermediate"
    : profile?.experience === "advanced"
      ? "Advanced"
      : "Beginner";

  const workoutDaysCount = scheduleConfig?.selectedDays?.length || plan.filter((d) => d.status !== "rest").length || 5;

  const totalWeekMinutes = useMemo(() => {
    return plan
      .filter((d) => d.status !== "rest")
      .reduce((sum, d) => sum + (d.totalMinutes || 0), 0) || 190;
  }, [plan]);

  // Re-generate different plan with Radar scanning
  const handleRegenerate = () => {
    setIsReanalyzing(true);
    setAnalysisStep(0);
    setAnalysisProgress(15);
  };

  useEffect(() => {
    if (!isReanalyzing) return;

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
      const allTags = [
        ...(scheduleConfig?.limitations || ["knee_pain", "no_jumping"]),
        ...(scheduleConfig?.equipment || ["bodyweight", "yoga_mat"]),
      ];
      const newPlan = generateAiWeeklyPlan({
        selectedDays: scheduleConfig?.selectedDays || [1, 2, 4, 5, 7],
        duration: scheduleConfig?.duration || "30-45",
        tags: allTags,
        limitations: scheduleConfig?.limitations || ["knee_pain", "no_jumping"],
        equipment: scheduleConfig?.equipment || ["bodyweight", "yoga_mat"],
        fitnessGoal: profile?.fitnessGoal || "Tập trung giảm 3cm vòng eo và săn chắc cơ thể",
        customWishes: profile?.customWishes || "",
      });
      if (setAiPlan) setAiPlan(newPlan);
      setIsReanalyzing(false);
    }, 2400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isReanalyzing, scheduleConfig, profile, setAiPlan]);

  // Apply Plan to App
  const handleApplySchedule = () => {
    if (onApplySchedule) {
      onApplySchedule(plan);
    }
    setSavedSuccess(true);
    setTimeout(() => {
      navigate("/schedule");
    }, 600);
  };

  return (
    <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Re-analyzing Radar State */}
      {isReanalyzing ? (
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
          {/* Radar Scan Ring Pulse */}
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
            AI Đang Tối Ưu Lại Giáo Án Tuần
          </Typography>

          <Box sx={{ height: 28, mb: 3 }}>
            {analysisStep === 0 && (
              <Typography variant="body2" sx={{ color: "#059669", fontWeight: 700, fontSize: "0.95rem" }}>
                ⚡ Đang phân tích mục tiêu & thể trạng của bạn...
              </Typography>
            )}
            {analysisStep === 1 && (
              <Typography variant="body2" sx={{ color: "#0284C7", fontWeight: 700, fontSize: "0.95rem" }}>
                🎯 Lọc danh sách video: "Low-impact, bảo vệ khớp gối, không nhảy"...
              </Typography>
            )}
            {analysisStep >= 2 && (
              <Typography variant="body2" sx={{ color: "#D97706", fontWeight: 700, fontSize: "0.95rem" }}>
                ✨ Tối ưu cấu trúc 3 clip/buổi & Lộ trình 7 ngày tập luyện...
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
        /* Result View */
        <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", overflowY: "auto", pr: 0.5, gap: 1.5 }}>
          {/* A. Banner Nhận xét & Đánh giá của AI Coach */}
          <Card
            sx={{
              p: 2,
              borderRadius: "16px",
              border: "1.5px solid #A7F3D0",
              background: "linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)",
              boxShadow: "0 2px 10px rgba(16, 185, 129, 0.08)",
              flexShrink: 0,
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: "50%",
                    bgcolor: "#10B981",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 10px rgba(16, 185, 129, 0.3)",
                  }}
                >
                  <AutoAwesomeIcon sx={{ fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 850, color: "#065F46", lineHeight: 1.2 }}>
                    AI Weekly Workout Plan (7 ngày)
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#047857", fontWeight: 600 }}>
                    Cá nhân hóa cho: {profile?.name || "Minh Trang"} ({profile?.gender === "female" ? "Nữ" : "Nam"}, {profile?.age || 24} tuổi) • {scheduleConfig?.duration || "30–45"} phút/buổi
                  </Typography>
                </Box>
              </Box>

              {/* Workout Goal & Schedule Specs (1 dòng duy nhất) */}
              <Box
                sx={{
                  bgcolor: "#FFFFFF",
                  px: 1.8,
                  py: 0.8,
                  borderRadius: 2.5,
                  border: "1px solid #A7F3D0",
                  boxShadow: "0 2px 6px rgba(16, 185, 129, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 800, color: "#065F46", fontSize: "0.82rem" }}>
                  🎯 Mục tiêu: {goalLabel}
                </Typography>
                <Box sx={{ width: "1px", height: 14, bgcolor: "#A7F3D0", display: { xs: "none", sm: "block" } }} />
                <Typography variant="caption" sx={{ color: "#047857", fontWeight: 700, fontSize: "0.78rem" }}>
                  🏋️ {experienceLabel} · ⏱ {scheduleConfig?.duration || "30–45"} phút/buổi · 📅 {workoutDaysCount} buổi/tuần
                </Typography>
              </Box>
            </Box>

            {/* Pastel AI Coach Note Box */}
            <Box sx={{ mt: 1.5, p: 1.3, borderRadius: 2.5, bgcolor: "rgba(255, 255, 255, 0.85)", border: "1px solid #A7F3D0" }}>
              <Typography variant="body2" sx={{ color: "#1E293B", fontSize: "0.82rem", lineHeight: 1.5 }}>
                💡 <strong>Gợi ý từ AI Coach:</strong> "Giáo án tuần này được tối ưu theo thời lượng <strong>{scheduleConfig?.duration || "30-45"} phút/buổi</strong>, ưu tiên bài tập <strong>Low-Impact (Không nhảy)</strong>, tập trung vào nhóm cơ Core/eo và giảm tối đa áp lực lên khớp gối theo thể trạng của bạn."
              </Typography>
            </Box>
          </Card>

          {/* B. Lộ trình 7 ngày trong tuần & Danh sách 3 Clip/buổi */}
          <Card
            sx={{
              p: 2,
              borderRadius: "16px",
              border: "1px solid #E5E7EB",
              bgcolor: "#FFFFFF",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
            }}
          >
            {/* Weekly Overview Line */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                bgcolor: "#F8FAFC",
                px: 1.8,
                py: 0.8,
                borderRadius: 2,
                border: "1px solid #E2E8F0",
                flexWrap: "wrap",
                gap: 0.8,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 700, color: "#334155", fontSize: "0.82rem" }}>
                🗓️ Tuần này: <strong>{workoutDaysCount} buổi</strong> · <strong>~{totalWeekMinutes} phút</strong> · <strong>Core · Lower Body · Full Body</strong>
              </Typography>
            </Box>

            {/* Day Selector Bar (T2 -> CN) */}
            <Box sx={{ display: "flex", gap: 1, width: "100%", justifyContent: "space-between" }}>
              {plan.map((day) => {
                const isSelected = selectedDayIndex === day.dayIndex;
                const isRest = day.status === "rest";
                const dayMeta = getWorkoutDayMeta(day);

                return (
                  <Box
                    key={day.dayIndex}
                    onClick={() => setSelectedDayIndex(day.dayIndex)}
                    sx={{
                      flex: 1,
                      p: 0.9,
                      borderRadius: 2.5,
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      bgcolor: isSelected ? "#10B981" : isRest ? "#F8FAFC" : "#FFFFFF",
                      color: isSelected ? "#FFFFFF" : isRest ? "#94A3B8" : "#0F172A",
                      border: isSelected ? "1.5px solid #059669" : "1px solid #E2E8F0",
                      boxShadow: isSelected ? "0 4px 12px rgba(16, 185, 129, 0.3)" : "none",
                      "&:hover": { borderColor: "#10B981" },
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 800, fontSize: "0.82rem", lineHeight: 1.1 }}>
                      {day.shortName}
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: "0.62rem", display: "block", opacity: isSelected ? 0.95 : 0.7 }}>
                      {day.dateStr}
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: "0.58rem", fontWeight: 700, mt: 0.2, display: "block" }}>
                      {isRest ? "Nghỉ" : `${day.totalMinutes}p · ${dayMeta?.intensity || "Moderate"}`}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            {/* Selected Day Routine Breakdown */}
            {(() => {
              const currentDay = plan.find((d) => d.dayIndex === selectedDayIndex) || plan[0];
              if (!currentDay) return null;

              if (currentDay.status === "rest") {
                return (
                  <Box
                    sx={{
                      p: 4,
                      borderRadius: 3,
                      bgcolor: "#F8FAFC",
                      border: "1px dashed #CBD5E1",
                      textAlign: "center",
                      my: "auto",
                    }}
                  >
                    <SelfImprovementIcon sx={{ fontSize: 52, color: "#94A3B8", mb: 1.5 }} />
                    <Typography variant="h6" sx={{ fontWeight: 800, color: "#334155", mb: 0.8 }}>
                      {currentDay.dayName} ({currentDay.dateStr}) — Ngày Nghỉ Phục Hồi 🧘
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 480, mx: "auto", fontSize: "0.85rem", lineHeight: 1.6 }}>
                      Nghỉ ngơi có kế hoạch là thời điểm then chốt giúp các bó cơ tái tạo và đốt mỡ thụ động. Hãy ngủ đủ 7-8 tiếng, uống đủ 2-2.5 lít nước và duy trì chế độ dinh dưỡng thâm hụt calo nhẹ nhàng.
                    </Typography>
                  </Box>
                );
              }

              return (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {/* Day Header Info */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1, borderBottom: "1px solid #F1F5F9", flexWrap: "wrap", gap: 1 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 850, color: "#0F172A", fontSize: "1.05rem" }}>
                        {currentDay.dayName} ({currentDay.dateStr}) — {currentDay.focusTitle}
                      </Typography>
                      
                    </Box>

                    {(() => {
                      const dayMeta = getWorkoutDayMeta(currentDay);
                      return dayMeta ? (
                        <Chip
                          label={`🎯 ${dayMeta.focus} · 🔥 ${dayMeta.intensity} · ⏱ ${dayMeta.minutes} phút`}
                          sx={{
                            bgcolor: "#ECFDF5",
                            color: "#059669",
                            fontWeight: 800,
                            fontSize: "0.82rem",
                            border: "1.5px solid #A7F3D0",
                            px: 0.6,
                            py: 0.5,
                            height: 28,
                          }}
                        />
                      ) : null;
                    })()}
                  </Box>

                  {/* 3 Clips Flow Container */}
                  <Grid container spacing={1.5}>
                    {/* Clip 1: Khởi động (Warm-up) */}
                    {currentDay.warmup && (
                      <Grid item xs={12} md={4}>
                        <Card sx={{ p: 1.2, borderRadius: 2.5, border: "1px solid #E2E8F0", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                          <Box>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.8 }}>
                              <Chip label="Clip 1: Khởi Động (3-5p)" size="small" sx={{ height: 18, fontSize: "0.62rem", fontWeight: 800, bgcolor: "#E0F2FE", color: "#0284C7" }} />
                              <Typography variant="caption" sx={{ fontWeight: 700, color: "#0284C7", fontSize: "0.68rem" }}>
                                {currentDay.warmup.durationMinutes} phút
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                width: "100%",
                                height: 95,
                                borderRadius: 2,
                                bgcolor: "#0F172A",
                                backgroundImage: `url(https://img.youtube.com/vi/${currentDay.warmup.youtubeVideoId}/hqdefault.jpg)`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                position: "relative",
                                mb: 1,
                              }}
                            >
                              <Box sx={{ position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <PlayCircleOutlineRoundedIcon sx={{ color: "#FFFFFF", fontSize: 32 }} />
                              </Box>
                            </Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: "0.8rem", lineHeight: 1.25, mb: 0.3 }}>
                              {currentDay.warmup.title}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#64748B", fontSize: "0.65rem", display: "block" }}>
                              Kênh: {currentDay.warmup.channel} • ~{currentDay.warmup.estimatedCalories} kcal
                            </Typography>
                          </Box>
                          <Typography variant="caption" sx={{ color: "#10B981", fontWeight: 600, fontSize: "0.62rem", mt: 0.8 }}>
                            ✓ Làm nóng khớp & giảm áp lực khớp gối
                          </Typography>
                        </Card>
                      </Grid>
                    )}

                    {/* Clip 2: Bài tập chính (Main Workout) */}
                    {currentDay.mainWorkouts?.[0] && (
                      <Grid item xs={12} md={4}>
                        <Card sx={{ p: 1.2, borderRadius: 2.5, border: "1.5px solid #10B981", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", bgcolor: "#FAFCFA" }}>
                          <Box>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.8 }}>
                              <Chip label="Clip 2: Bài Chính (15-25p)" size="small" sx={{ height: 18, fontSize: "0.62rem", fontWeight: 800, bgcolor: "#DCFCE7", color: "#15803D" }} />
                              <Typography variant="caption" sx={{ fontWeight: 800, color: "#15803D", fontSize: "0.68rem" }}>
                                {currentDay.mainWorkouts[0].durationMinutes} phút
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                width: "100%",
                                height: 95,
                                borderRadius: 2,
                                bgcolor: "#0F172A",
                                backgroundImage: `url(https://img.youtube.com/vi/${currentDay.mainWorkouts[0].youtubeVideoId}/hqdefault.jpg)`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                position: "relative",
                                mb: 1,
                              }}
                            >
                              <Box sx={{ position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <PlayCircleOutlineRoundedIcon sx={{ color: "#FFFFFF", fontSize: 32 }} />
                              </Box>
                            </Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: "0.8rem", lineHeight: 1.25, mb: 0.3 }}>
                              {currentDay.mainWorkouts[0].title}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#64748B", fontSize: "0.65rem", display: "block" }}>
                              Kênh: {currentDay.mainWorkouts[0].channel} • ~{currentDay.mainWorkouts[0].estimatedCalories} kcal
                            </Typography>
                          </Box>
                          <Typography variant="caption" sx={{ color: "#15803D", fontWeight: 700, fontSize: "0.62rem", mt: 0.8 }}>
                            ✓ {currentDay.mainWorkouts[0].intensity} • {currentDay.mainWorkouts[0].equipment}
                          </Typography>
                        </Card>
                      </Grid>
                    )}

                    {/* Clip 3: Giãn cơ (Cool-down) */}
                    {currentDay.cooldown && (
                      <Grid item xs={12} md={4}>
                        <Card sx={{ p: 1.2, borderRadius: 2.5, border: "1px solid #E2E8F0", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                          <Box>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.8 }}>
                              <Chip label="Clip 3: Giãn Cơ (5-10p)" size="small" sx={{ height: 18, fontSize: "0.62rem", fontWeight: 800, bgcolor: "#F3E8FF", color: "#7E22CE" }} />
                              <Typography variant="caption" sx={{ fontWeight: 700, color: "#7E22CE", fontSize: "0.68rem" }}>
                                {currentDay.cooldown.durationMinutes} phút
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                width: "100%",
                                height: 95,
                                borderRadius: 2,
                                bgcolor: "#0F172A",
                                backgroundImage: `url(https://img.youtube.com/vi/${currentDay.cooldown.youtubeVideoId}/hqdefault.jpg)`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                position: "relative",
                                mb: 1,
                              }}
                            >
                              <Box sx={{ position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <PlayCircleOutlineRoundedIcon sx={{ color: "#FFFFFF", fontSize: 32 }} />
                              </Box>
                            </Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: "0.8rem", lineHeight: 1.25, mb: 0.3 }}>
                              {currentDay.cooldown.title}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#64748B", fontSize: "0.65rem", display: "block" }}>
                              Kênh: {currentDay.cooldown.channel} • ~{currentDay.cooldown.estimatedCalories} kcal
                            </Typography>
                          </Box>
                          <Typography variant="caption" sx={{ color: "#7E22CE", fontWeight: 600, fontSize: "0.62rem", mt: 0.8 }}>
                            ✓ Hạ nhịp tim & giải phóng căng thẳng cơ
                          </Typography>
                        </Card>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              );
            })()}
          </Card>

          {/* C. Action Bar: Chấp nhận đề xuất hoặc chỉnh sửa */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: "16px",
              bgcolor: "#FFFFFF",
              border: "1px solid #E5E7EB",
              boxShadow: "0 -2px 12px rgba(0, 0, 0, 0.03)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexShrink: 0,
              flexWrap: "wrap",
              gap: 1.5,
            }}
          >
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                onClick={() => navigate("/profile")}
                variant="outlined"
                color="inherit"
                startIcon={<EditIcon sx={{ fontSize: 16 }} />}
                sx={{ borderRadius: 2.5, fontWeight: 700, fontSize: "0.82rem" }}
              >
                Chỉnh Sửa Hồ Sơ & Cấu Hình
              </Button>

              <Button
                onClick={handleRegenerate}
                variant="outlined"
                color="primary"
                startIcon={<RestartAltIcon sx={{ fontSize: 16 }} />}
                sx={{ borderRadius: 2.5, fontWeight: 700, fontSize: "0.82rem" }}
              >
                AI Tạo Lại Lịch Khác
              </Button>
            </Box>

            <Button
              onClick={handleApplySchedule}
              variant="contained"
              color="primary"
              size="large"
              startIcon={<CheckCircleIcon sx={{ fontSize: 20 }} />}
              sx={{
                px: 3.5,
                py: 1,
                borderRadius: "12px",
                fontSize: "0.92rem",
                fontWeight: 850,
                background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                boxShadow: "0 4px 15px rgba(16, 185, 129, 0.35)",
                "&:hover": {
                  background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                  boxShadow: "0 6px 20px rgba(16, 185, 129, 0.45)",
                },
              }}
            >
              Áp Dụng Lịch Tập Này & Bắt Đầu
            </Button>
          </Box>
        </Box>
      )}

      {/* Snackbar feedback */}
      <Snackbar open={savedSuccess} autoHideDuration={3000} onClose={() => setSavedSuccess(false)}>
        <Alert severity="success" sx={{ width: "100%", borderRadius: 2 }}>
          Lịch tập mới đã được áp dụng thành công! Đang chuyển tới phòng tập...
        </Alert>
      </Snackbar>
    </Box>
  );
}
