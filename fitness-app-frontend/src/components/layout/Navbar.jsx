import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";

export default function Navbar({ onMobileMenuToggle, user }) {
  const displayName = user?.preferred_username || user?.name || "Minh Trang";

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "#F9F9F9",
        color: "#1F2937",
        borderBottom: "1px solid #E5E7EB",
        zIndex: (theme) => theme.zIndex.drawer + 1,
        height: 62,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, md: 3 }, minHeight: "62px !important", height: 62 }}>
        {/* Brand & Mobile Toggle */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={onMobileMenuToggle}
            sx={{ display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Box
            component="img"
            src="/logo.png"
            alt="Zero Fitness Logo"
            sx={{
              width: 46,
              height: 46,
              objectFit: "contain",
              mixBlendMode: "multiply",
              display: "block",
            }}
          />

          <Box>
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 800,
                letterSpacing: -0.5,
                color: "#15803D",
                lineHeight: 1.1,
                fontSize: "1.2rem",
              }}
            >
              Zero Fitness
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "#6B7280", fontWeight: 500, fontSize: "0.68rem" }}
            >
              Smart Fitness & Body Coaching
            </Typography>
          </Box>
        </Box>

        {/* User Info Avatar */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.2,
            py: 0.5,
            px: 1.5,
            borderRadius: 3,
            bgcolor: "#F7F8FA",
            border: "1px solid #E5E7EB",
          }}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: "#16A34A",
              fontSize: "0.85rem",
              fontWeight: 700,
            }}
          >
            {displayName.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              {displayName}
            </Typography>

          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
