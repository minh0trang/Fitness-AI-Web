import React from "react";
import {
  Box,
  Typography,
  Card,
  Button,
  Chip,
  Divider,
  Stack,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import ScienceIcon from "@mui/icons-material/Science";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import LoginIcon from "@mui/icons-material/Login";
import SecurityIcon from "@mui/icons-material/Security";
import BoltIcon from "@mui/icons-material/Bolt";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

export default function LoginPage({ onLogin, onRegister, onGuestEnter }) {
  return (
    <Box
      sx={{
        height: "100vh",
        maxHeight: "100vh",
        width: "100vw",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#0B132B",
        background: `
          radial-gradient(circle at 15% 20%, rgba(22, 163, 74, 0.18) 0%, transparent 45%),
          radial-gradient(circle at 85% 80%, rgba(13, 148, 136, 0.18) 0%, transparent 45%),
          radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.98) 0%, #0B1120 100%)
        `,
        p: { xs: 2, md: 3 },
        position: "relative",
      }}
    >
      {/* Background ambient lighting */}
      <Box
        sx={{
          position: "absolute",
          top: "-5%",
          right: "-5%",
          width: 380,
          height: 380,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(34, 197, 94, 0.12) 0%, transparent 70%)",
          filter: "blur(50px)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "-5%",
          left: "-5%",
          width: 350,
          height: 350,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(14, 165, 233, 0.1) 0%, transparent 70%)",
          filter: "blur(50px)",
          pointerEvents: "none",
        }}
      />

      <Card
        sx={{
          maxWidth: 960,
          width: "100%",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "stretch",
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.1)",
          bgcolor: "#0F172A",
        }}
      >
        {/* Left Column: Brand Hero Presentation (50% width) */}
        <Box
          sx={{
            width: { xs: "100%", md: "50%" },
            background: "linear-gradient(150deg, #0F172A 0%, #132A1E 50%, #15803D 100%)",
            p: { xs: 3, md: 4 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            borderRight: { md: "1px solid rgba(255, 255, 255, 0.1)" },
          }}
        >
          {/* Top Brand Identity */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 2 }}>
              <Box
                component="img"
                src="/logo.png"
                alt="Zero Fitness Logo"
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: "12px",
                  objectFit: "contain",
                  p: 0.4,
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                }}
              />
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 900,
                    letterSpacing: -0.3,
                    lineHeight: 1.1,
                    color: "#FFFFFF !important",
                  }}
                >
                  Zero Fitness
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#86EFAC !important",
                    fontWeight: 700,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    fontSize: "0.65rem",
                    display: "block",
                  }}
                >
                  AI Coach & Health IAM
                </Typography>
              </Box>
            </Box>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                fontSize: { xs: "1.3rem", md: "1.5rem" },
                lineHeight: 1.3,
                mb: 1,
                letterSpacing: -0.3,
                color: "#FFFFFF !important",
              }}
            >
              Huấn luyện thể hình với{" "}
              <Box
                component="span"
                sx={{
                  color: "#4ADE80 !important",
                  display: "inline",
                }}
              >
                Trí tuệ nhân tạo
              </Box>
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: "rgba(255, 255, 255, 0.82) !important",
                lineHeight: 1.55,
                fontSize: "0.85rem",
                mb: 2.5,
              }}
            >
              Tự động thiết kế lịch tập 7 ngày thông minh, chọn lọc video chuẩn khoa học và thích ứng linh hoạt theo thể trạng.
            </Typography>

            {/* 3 Core Highlights */}
            <Stack spacing={1.2}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1.2,
                  borderRadius: 2.5,
                  bgcolor: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 2,
                    bgcolor: "rgba(34, 197, 94, 0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#4ADE80",
                    flexShrink: 0,
                  }}
                >
                  <BoltIcon sx={{ fontSize: 18 }} />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#FFFFFF !important", fontSize: "0.82rem" }}>
                    AI Coach Gemini Thích Ứng
                  </Typography>
                  <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.72) !important", display: "block", fontSize: "0.7rem" }}>
                    Loại bỏ động tác hại khớp & tối ưu theo lịch bận.
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1.2,
                  borderRadius: 2.5,
                  bgcolor: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 2,
                    bgcolor: "rgba(56, 189, 248, 0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#38BDF8",
                    flexShrink: 0,
                  }}
                >
                  <ScienceIcon sx={{ fontSize: 18 }} />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#FFFFFF !important", fontSize: "0.82rem" }}>
                    Khoa Học Thể Chất & TDEE / BMR
                  </Typography>
                  <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.72) !important", display: "block", fontSize: "0.7rem" }}>
                    Phân tích tiêu hao năng lượng và số đo 3 vòng.
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1.2,
                  borderRadius: 2.5,
                  bgcolor: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 2,
                    bgcolor: "rgba(244, 63, 94, 0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FB7185",
                    flexShrink: 0,
                  }}
                >
                  <PlayCircleIcon sx={{ fontSize: 18 }} />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#FFFFFF !important", fontSize: "0.82rem" }}>
                    Video Giáo Án 3 Pha Chuẩn Y Khoa
                  </Typography>
                  <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.72) !important", display: "block", fontSize: "0.7rem" }}>
                    Khởi động ➔ Bài tập chính ➔ Giãn cơ an toàn.
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Box>

          {/* Bottom Security Badge */}
          <Box
            sx={{
              mt: 2.5,
              pt: 1.8,
              borderTop: "1px solid rgba(255, 255, 255, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.8) !important", fontSize: "0.72rem" }}>
              Đồng bộ bảo mật qua Keycloak IAM
            </Typography>
            <Chip
              icon={<SecurityIcon sx={{ fontSize: "13px !important", color: "#86EFAC !important" }} />}
              label="OAuth2 Verified"
              size="small"
              sx={{
                bgcolor: "rgba(22, 163, 74, 0.25)",
                color: "#86EFAC",
                fontWeight: 700,
                fontSize: "0.65rem",
                height: 22,
                border: "1px solid rgba(134, 239, 172, 0.3)",
              }}
            />
          </Box>
        </Box>

        {/* Right Column: Authentication & Action Portal (50% width) */}
        <Box
          sx={{
            width: { xs: "100%", md: "50%" },
            bgcolor: "#FFFFFF",
            p: { xs: 3, md: 4.5 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/* Header */}
          <Box sx={{ mb: 2.5 }}>
            <Chip
              icon={<AutoAwesomeIcon sx={{ color: "#16A34A !important", fontSize: "14px !important" }} />}
              label="CỔNG TRUY CẬP ZERO FITNESS"
              size="small"
              sx={{
                bgcolor: "#DCFCE7",
                color: "#15803D",
                fontWeight: 800,
                fontSize: "0.68rem",
                letterSpacing: 0.5,
                mb: 1.2,
                height: 22,
              }}
            />
            <Typography
              variant="h5"
              sx={{
                fontWeight: 900,
                color: "#0F172A",
                mb: 0.8,
                letterSpacing: -0.4,
                fontSize: { xs: "1.35rem", md: "1.55rem" },
              }}
            >
              Bắt đầu hành trình rèn luyện 🚀
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B", lineHeight: 1.5, fontSize: "0.85rem" }}>
              Đăng nhập hoặc đăng ký tài khoản để đồng bộ hóa lịch trình tập luyện cá nhân hóa của bạn.
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Stack spacing={1.8}>
            {/* Primary: Login */}
            <Box>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                onClick={() => {
                  if (onLogin) onLogin();
                }}
                startIcon={<LoginIcon />}
                sx={{
                  py: 1.3,
                  fontSize: "0.98rem",
                  fontWeight: 800,
                  borderRadius: 2.5,
                  background: "linear-gradient(135deg, #16A34A 0%, #15803D 100%)",
                  boxShadow: "0 4px 14px rgba(22, 163, 74, 0.3)",
                  letterSpacing: 0.2,
                  textTransform: "none",
                  "&:hover": {
                    background: "linear-gradient(135deg, #15803D 0%, #166534 100%)",
                    boxShadow: "0 6px 18px rgba(22, 163, 74, 0.4)",
                  },
                }}
              >
                Đăng Nhập Với Keycloak
              </Button>
              <Typography
                variant="caption"
                sx={{
                  color: "#64748B",
                  display: "block",
                  textAlign: "center",
                  mt: 0.6,
                  fontSize: "0.72rem",
                }}
              >
                Dành cho thành viên đã có tài khoản
              </Typography>
            </Box>

            {/* Secondary: Register */}
            <Box>
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                size="large"
                onClick={() => {
                  if (onRegister) onRegister();
                }}
                startIcon={<PersonAddAlt1Icon />}
                sx={{
                  py: 1.2,
                  fontSize: "0.95rem",
                  fontWeight: 800,
                  borderRadius: 2.5,
                  borderWidth: "1.8px",
                  borderColor: "#16A34A",
                  color: "#16A34A",
                  bgcolor: "rgba(240, 253, 244, 0.5)",
                  letterSpacing: 0.2,
                  textTransform: "none",
                  "&:hover": {
                    borderWidth: "1.8px",
                    borderColor: "#15803D",
                    bgcolor: "#16A34A",
                    color: "#FFFFFF",
                  },
                }}
              >
                Tạo Tài Khoản Mới (Đăng Ký)
              </Button>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0.6,
                  mt: 0.6,
                }}
              >
                <CheckCircleRoundedIcon sx={{ fontSize: 13, color: "#16A34A" }} />
                <Typography variant="caption" sx={{ color: "#15803D", fontWeight: 600, fontSize: "0.72rem" }}>
                  Xác thực Gmail bảo mật • Miễn phí lộ trình AI
                </Typography>
              </Box>
            </Box>
          </Stack>

          {/* Divider */}
          <Divider sx={{ my: 2, color: "#94A3B8", fontSize: "0.7rem", fontWeight: 700 }}>
            HOẶC
          </Divider>

          {/* Guest Mode */}
          <Button
            variant="text"
            color="inherit"
            size="small"
            onClick={() => {
              if (onGuestEnter) onGuestEnter();
            }}
            endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: "14px !important" }} />}
            sx={{
              py: 0.6,
              fontSize: "0.82rem",
              fontWeight: 600,
              borderRadius: 2,
              color: "#64748B",
              textTransform: "none",
              "&:hover": {
                color: "#16A34A",
                bgcolor: "rgba(22, 163, 74, 0.05)",
              },
            }}
          >
            Xem trước giao diện với tư cách Khách tham quan
          </Button>

          {/* Trust Footer */}
          <Box
            sx={{
              mt: 2.2,
              pt: 1.5,
              borderTop: "1px dashed #E2E8F0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.8,
            }}
          >
            <SecurityIcon sx={{ fontSize: 14, color: "#94A3B8" }} />
            <Typography variant="caption" sx={{ color: "#94A3B8", fontWeight: 500, fontSize: "0.7rem" }}>
              Bảo vệ bởi Keycloak Realm <strong>zero-fitness</strong> • Mã hóa SSL 256-bit
            </Typography>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
