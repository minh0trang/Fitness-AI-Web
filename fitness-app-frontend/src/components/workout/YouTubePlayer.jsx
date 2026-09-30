import React, { useEffect, useRef, useState } from "react";
import { Box, Typography, LinearProgress, Chip, IconButton, Tooltip } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";

let isApiLoaded = false;
let apiLoadingPromise = null;

function loadYouTubeApi() {
  if (isApiLoaded) return Promise.resolve();
  if (apiLoadingPromise) return apiLoadingPromise;

  apiLoadingPromise = new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      isApiLoaded = true;
      resolve();
    } else {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      window.onYouTubeIframeAPIReady = () => {
        isApiLoaded = true;
        resolve();
      };
      document.body.appendChild(tag);
    }
  });

  return apiLoadingPromise;
}

export default function YouTubePlayer({
  videoId,
  onVideoProgress,
  onVideoCompleted,
  theaterMode,
  onToggleTheater,
}) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const timerRef = useRef(null);

  const [progressPercent, setProgressPercent] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playerState, setPlayerState] = useState("IDLE");
  const [hasTriggeredComplete, setHasTriggeredComplete] = useState(false);

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    setHasTriggeredComplete(false);
    setProgressPercent(0);
    setCurrentTime(0);

    let isMounted = true;

    loadYouTubeApi().then(() => {
      if (!isMounted || !containerRef.current) return;

      if (playerRef.current && playerRef.current.cueVideoById) {
        try {
          playerRef.current.cueVideoById(videoId);
          return;
        } catch (err) {
          console.warn("Could not cue video, recreating", err);
        }
      }

      playerRef.current = new window.YT.Player(containerRef.current, {
        height: "100%",
        width: "100%",
        videoId: videoId,
        playerVars: {
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: (event) => {
            const dur = event.target.getDuration();
            setDuration(dur);
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setPlayerState("PLAYING");
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setPlayerState("PAUSED");
            } else if (event.data === window.YT.PlayerState.ENDED) {
              setPlayerState("ENDED");
              setProgressPercent(100);
              if (!hasTriggeredComplete && onVideoCompleted) {
                setHasTriggeredComplete(true);
                onVideoCompleted(videoId);
              }
            }
          },
        },
      });
    });

    return () => {
      isMounted = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [videoId]);

  useEffect(() => {
    if (playerState === "PLAYING") {
      timerRef.current = setInterval(() => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          const cur = playerRef.current.getCurrentTime() || 0;
          const dur = playerRef.current.getDuration() || duration || 1;
          setCurrentTime(cur);
          if (dur > 0) {
            setDuration(dur);
            const percent = Math.min(100, Math.round((cur / dur) * 100));
            setProgressPercent(percent);
            if (onVideoProgress) onVideoProgress(percent, cur, dur);

            // Auto-trigger completion when reaching 80%
            if (percent >= 80 && !hasTriggeredComplete) {
              setHasTriggeredComplete(true);
              if (onVideoCompleted) onVideoCompleted(videoId);
            }
          }
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playerState, duration, hasTriggeredComplete, videoId, onVideoProgress, onVideoCompleted]);

  return (
    <Box sx={{ width: "100%", height: "100%", borderRadius: 2.5, overflow: "hidden", bgcolor: "#000", display: "flex", flexDirection: "column" }}>
      {/* Video Container filling available space */}
      <Box sx={{ position: "relative", flex: 1, minHeight: 0, width: "100%", bgcolor: "#000" }}>
        <Box
          ref={containerRef}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        />
      </Box>

      {/* Progress tracking bar below video */}
      <Box sx={{ px: 1.5, py: 0.7, bgcolor: "#111827", color: "#F3F4F6", flexShrink: 0 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {hasTriggeredComplete ? (
              <Chip
                icon={<CheckCircleIcon sx={{ color: "#16A34A !important", fontSize: "0.85rem !important" }} />}
                label="Đã hoàn thành bài tập này (≥80%)"
                size="small"
                sx={{ height: 22, bgcolor: "rgba(22, 163, 74, 0.25)", color: "#4ADE80", fontWeight: 700, fontSize: "0.72rem" }}
              />
            ) : (
              <Chip
                icon={<PlayCircleFilledIcon sx={{ color: "#38BDF8 !important", fontSize: "0.85rem !important" }} />}
                label={playerState === "PLAYING" ? "Đang phát video" : "Sẵn sàng tập"}
                size="small"
                sx={{ height: 22, bgcolor: "rgba(56, 189, 248, 0.2)", color: "#38BDF8", fontWeight: 500, fontSize: "0.72rem" }}
              />
            )}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" sx={{ color: "#9CA3AF", fontFamily: "monospace", fontSize: "0.78rem" }}>
              {formatTime(currentTime)} / {formatTime(duration)} ({progressPercent}%)
            </Typography>

            {onToggleTheater && (
              <Tooltip title={theaterMode ? "Thu nhỏ" : "Chế độ rạp chiếu phim"}>
                <IconButton size="small" onClick={onToggleTheater} sx={{ color: "#9CA3AF", p: 0.2 }}>
                  {theaterMode ? <FullscreenExitIcon sx={{ fontSize: "1.1rem" }} /> : <FullscreenIcon sx={{ fontSize: "1.1rem" }} />}
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        <LinearProgress
          variant="determinate"
          value={progressPercent}
          sx={{
            height: 4,
            borderRadius: 2,
            bgcolor: "#374151",
            "& .MuiLinearProgress-bar": {
              bgcolor: progressPercent >= 80 ? "#16A34A" : "#38BDF8",
            },
          }}
        />
      </Box>
    </Box>
  );
}
