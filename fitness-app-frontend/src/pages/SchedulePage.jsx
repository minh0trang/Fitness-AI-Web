import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import SelfImprovementIcon from "@mui/icons-material/SelfImprovement";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import YouTubePlayer from "../components/workout/YouTubePlayer";
import WorkoutJournalDialog from "../components/workout/WorkoutJournalDialog";
import { getWorkoutDayMeta } from "../data/mockWorkouts";

export default function SchedulePage({ schedule, onCompleteWorkout }) {
  const defaultIndex = schedule.findIndex((s) => s.status === "today");
  const [selectedDayIndex, setSelectedDayIndex] = useState(
    defaultIndex !== -1 ? defaultIndex : 0
  );

  const currentRoutine = schedule[selectedDayIndex];

  // Compile playlist: Warmup -> Mains -> Cooldown
  const playlist = [];
  if (currentRoutine?.warmup) {
    playlist.push({ ...currentRoutine.warmup, section: "Khởi động (Tùy chọn)", isOptional: true });
  }
  if (currentRoutine?.mainWorkouts) {
    currentRoutine.mainWorkouts.forEach((mw, idx) => {
      playlist.push({ ...mw, section: `Bài chính ${idx + 1}`, isOptional: false });
    });
  }
  if (currentRoutine?.cooldown) {
    playlist.push({ ...currentRoutine.cooldown, section: "Giãn cơ (Tùy chọn)", isOptional: true });
  }

  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const activeVideo = playlist[activeVideoIndex] || playlist[0];

  const [completedVideoIds, setCompletedVideoIds] = useState({});
  const [journalOpen, setJournalOpen] = useState(false);
  const [theaterMode, setTheaterMode] = useState(false);
  const [restSeconds, setRestSeconds] = useState(0);

  const handleStartRestTimer = () => {
    setRestSeconds(60);
    const interval = setInterval(() => {
      setRestSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVideoCompleted = (videoId) => {
    setCompletedVideoIds((prev) => ({ ...prev, [videoId]: true }));
  };

  const toggleVideoDone = (videoId, e) => {
    e.stopPropagation();
    setCompletedVideoIds((prev) => ({ ...prev, [videoId]: !prev[videoId] }));
  };

  const handleFinishRoutine = () => {
    setJournalOpen(true);
  };

  const handleJournalSubmit = (entry) => {
    if (onCompleteWorkout) {
      onCompleteWorkout(selectedDayIndex, entry);
    }
  };

  return (
    <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", gap: 1, overflow: "hidden" }}>
      {/* Compact Week Timeline Bar (7 Days: T2 -> CN across 100% width) */}
      <Card sx={{ borderRadius: "16px", border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", flexShrink: 0, bgcolor: "#FFFFFF" }}>
        <CardContent sx={{ p: 0.8, "&:last-child": { pb: 0.8 } }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              gap: 1,
              width: "100%",
            }}
          >
            {schedule.slice(0, 7).map((item, idx) => {
              const isSelected = selectedDayIndex === idx;
              const isCompleted = item.status === "completed";
              const isToday = item.status === "today";
              const isRest = item.status === "rest";

              return (
                <Box
                  key={idx}
                  onClick={() => {
                    setSelectedDayIndex(idx);
                    setActiveVideoIndex(0);
                  }}
                  sx={{
                    flex: "1 1 0",
                    textAlign: "center",
                    py: 0.5,
                    px: 0.5,
                    borderRadius: 2,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    bgcolor: isSelected
                      ? "#ECFDF5"
                      : isCompleted
                      ? "#F0FDF4"
                      : "#FFFFFF",
                    border: isSelected
                      ? "2px solid #10B981"
                      : "1px solid #E2E8F0",
                    boxShadow: isSelected ? "0 2px 6px rgba(16, 185, 129, 0.12)" : "none",
                    "&:hover": { borderColor: "#10B981" },
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      fontWeight: 700,
                      color: isSelected ? "#059669" : isToday ? "#D97706" : "#64748B",
                      fontSize: "0.65rem",
                      lineHeight: 1,
                    }}
                  >
                    {item.dayName}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 800,
                      my: 0.15,
                      color: isSelected ? "#059669" : "#0F172A",
                      lineHeight: 1.1,
                      fontSize: "0.9rem",
                    }}
                  >
                    {item.shortName}
                  </Typography>

                  {isCompleted && (
                    <Chip
                      icon={<CheckCircleIcon sx={{ fontSize: "0.65rem !important", color: "#10B981 !important" }} />}
                      label="Xong"
                      size="small"
                      sx={{ height: 16, fontSize: "0.58rem", bgcolor: "#DCFCE7", color: "#15803D", fontWeight: 700 }}
                    />
                  )}
                  {isToday && !isCompleted && (
                    <Chip
                      label="Hôm nay"
                      size="small"
                      sx={{ height: 16, fontSize: "0.58rem", bgcolor: "#FEF3C7", color: "#D97706", fontWeight: 700 }}
                    />
                  )}
                  {isRest && (
                    <Chip
                      label="Nghỉ"
                      size="small"
                      sx={{ height: 16, fontSize: "0.58rem", bgcolor: "#F1F5F9", color: "#64748B" }}
                    />
                  )}
                  {!isCompleted && !isToday && !isRest && (
                    <Chip
                      label="Sắp tới"
                      size="small"
                      sx={{ height: 16, fontSize: "0.58rem", bgcolor: "#F8FAFC", color: "#94A3B8" }}
                    />
                  )}
                </Box>
              );
            })}
          </Box>
        </CardContent>
      </Card>

      {/* Routine Session Area */}
      {currentRoutine && currentRoutine.status !== "rest" && playlist.length > 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", lg: theaterMode ? "column" : "row" },
            gap: 1.2,
            alignItems: "stretch",
            width: "100%",
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          {/* Left Column: Pure Video Player */}
          <Box sx={{ flex: 1, minWidth: 0, height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <Card sx={{ borderRadius: 2.5, overflow: "hidden", border: "1px solid #E2E8F0", bgcolor: "#000", height: "100%", display: "flex", flexDirection: "column" }}>
              {activeVideo && (
                <YouTubePlayer
                  videoId={activeVideo.youtubeVideoId}
                  onVideoCompleted={handleVideoCompleted}
                  theaterMode={theaterMode}
                  onToggleTheater={() => setTheaterMode(!theaterMode)}
                />
              )}
            </Card>
          </Box>

          {/* Right Column: Playlist strictly alongside video */}
          <Box sx={{ width: { xs: "100%", lg: theaterMode ? "100%" : 370 }, flexShrink: 0, height: "100%", display: "flex", flexDirection: "column" }}>
            <Card sx={{ p: 1.5, borderRadius: 2.5, border: "1px solid #E2E8F0", bgcolor: "#FFFFFF", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
              {/* Header with Title and Rest Timer */}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1, flexShrink: 0 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0F172A", lineHeight: 1.2, fontSize: "0.88rem" }}>
                    Danh Sách Bài Tập ({playlist.length} video)
                  </Typography>
                  {(() => {
                    const dayMeta = getWorkoutDayMeta(currentRoutine);
                    return dayMeta ? (
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "#059669", fontSize: "0.72rem" }}>
                        🎯 {dayMeta.focus} · 🔥 {dayMeta.intensity} · ⏱ {currentRoutine.totalMinutes} phút
                      </Typography>
                    ) : (
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "#059669", fontSize: "0.72rem" }}>
                        ⏱ {currentRoutine.totalMinutes} phút
                      </Typography>
                    );
                  })()}
                </Box>

                <Button
                  variant="outlined"
                  color="secondary"
                  size="small"
                  startIcon={<HourglassBottomIcon sx={{ fontSize: "0.85rem" }} />}
                  onClick={handleStartRestTimer}
                  sx={{ borderRadius: 1.8, fontWeight: 700, py: 0.3, px: 1, fontSize: "0.72rem", borderColor: "#E2E8F0" }}
                >
                  {restSeconds > 0 ? `${restSeconds}s` : "⏱️ Nghỉ 60s"}
                </Button>
              </Box>

              {/* Playlist Items - Evenly filling available space */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, overflowY: "auto", flex: 1, minHeight: 0, pr: 0.5 }}>
                {playlist.map((item, idx) => {
                  const isSelected = activeVideoIndex === idx;
                  const isDone = completedVideoIds[item.youtubeVideoId];

                  return (
                    <Box
                      key={idx}
                      onClick={() => setActiveVideoIndex(idx)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.2,
                        p: 1,
                        flex: "1 1 0",
                        minHeight: 74,
                        borderRadius: 2,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        bgcolor: isSelected ? "#F0FDF4" : "#FFFFFF",
                        border: isSelected ? "2px solid #10B981" : "1px solid #E2E8F0",
                        boxShadow: isSelected ? "0 2px 8px rgba(16, 185, 129, 0.15)" : "none",
                        "&:hover": { borderColor: "#10B981" },
                      }}
                    >
                      {/* Thumbnail with Grayscale for optional videos */}
                      <Box
                        sx={{
                          position: "relative",
                          width: { xs: 84, sm: 96 },
                          height: "100%",
                          minHeight: 56,
                          maxHeight: 70,
                          borderRadius: 1.5,
                          overflow: "hidden",
                          flexShrink: 0,
                        }}
                      >
                        <Box
                          component="img"
                          src={`https://img.youtube.com/vi/${item.youtubeVideoId}/hqdefault.jpg`}
                          alt={item.title}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            filter: item.isOptional ? "grayscale(85%)" : "none",
                            transition: "filter 0.2s",
                            "&:hover": { filter: "none" },
                          }}
                        />
                        <Box
                          sx={{
                            position: "absolute",
                            bottom: 3,
                            right: 3,
                            bgcolor: "rgba(0,0,0,0.85)",
                            color: "#fff",
                            px: 0.5,
                            py: 0.1,
                            borderRadius: 0.6,
                            fontSize: "0.62rem",
                            fontWeight: 700,
                          }}
                        >
                          {item.durationMinutes}p
                        </Box>
                      </Box>

                      {/* Video Info */}
                      <Box sx={{ flexGrow: 1, minWidth: 0, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", py: 0.2 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 700,
                              color: item.isOptional ? "#64748B" : "#059669",
                              fontSize: "0.68rem",
                              lineHeight: 1,
                            }}
                          >
                            {item.section}
                          </Typography>

                          <IconButton
                            size="small"
                            onClick={(e) => toggleVideoDone(item.youtubeVideoId, e)}
                            sx={{ p: 0.1 }}
                          >
                            {isDone ? (
                              <CheckCircleIcon sx={{ fontSize: 18, color: "#10B981" }} />
                            ) : (
                              <RadioButtonUncheckedIcon sx={{ fontSize: 18, color: "#CBD5E1" }} />
                            )}
                          </IconButton>
                        </Box>

                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: isSelected ? 800 : 600,
                            lineHeight: 1.25,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            fontSize: "0.8rem",
                            color: "#0F172A",
                            my: 0.2,
                          }}
                        >
                          {item.title}
                        </Typography>

                        <Typography variant="caption" sx={{ color: "#64748B", fontSize: "0.68rem", fontWeight: 500 }}>
                          {item.channel} • ~{item.estimatedCalories} kcal
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>

              <Button
                variant="contained"
                color="primary"
                size="small"
                fullWidth
                onClick={handleFinishRoutine}
                startIcon={<CheckCircleIcon sx={{ fontSize: "1rem" }} />}
                sx={{
                  mt: 1.2,
                  py: 1,
                  fontSize: "0.85rem",
                  fontWeight: 800,
                  borderRadius: 2,
                  boxShadow: "0 2px 6px rgba(16, 185, 129, 0.2)",
                  flexShrink: 0,
                }}
              >
                🎉 Hoàn thành toàn bộ buổi tập
              </Button>
            </Card>
          </Box>
        </Box>
      ) : (
        /* Rest Day Card */
        <Card
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 3,
            bgcolor: "#F8FAFC",
            border: "1px dashed #CBD5E1",
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              display: "inline-flex",
              p: 2,
              borderRadius: "50%",
              bgcolor: "#E0F2FE",
              color: "#0284C7",
              mb: 1.5,
            }}
          >
            <SelfImprovementIcon sx={{ fontSize: 40 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#0F172A", mb: 0.5 }}>
            Hôm nay là Ngày Nghỉ Ngơi Phục Hồi 🧘
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#64748B", maxWidth: 450, mx: "auto", mb: 2 }}
          >
            Hãy để cơ bắp tái tạo và giải phóng mệt mỏi. Bạn có thể đi dạo nhẹ nhàng hoặc uống nhiều nước nhé!
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setSelectedDayIndex((selectedDayIndex + 1) % schedule.length)}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            Xem buổi tập tiếp theo
          </Button>
        </Card>
      )}

      {/* Workout Journal Dialog */}
      <WorkoutJournalDialog
        open={journalOpen}
        routine={currentRoutine}
        onClose={() => setJournalOpen(false)}
        onSubmitJournal={handleJournalSubmit}
      />
    </Box>
  );
}
