import React from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

const DRAWER_WIDTH = 250;

const NAV_ITEMS = [
  {
    text: "Tổng quan",
    path: "/dashboard",
    icon: <DashboardIcon />,
  },
  {
    text: "Lịch & Bài tập",
    path: "/schedule",
    icon: <CalendarMonthIcon />,
  },
  {
    text: "Kế hoạch AI",
    path: "/ai-plan",
    icon: <AutoAwesomeIcon />,
    badge: "Mới",
  },
  {
    text: "Tiến độ",
    path: "/progress",
    icon: <TrendingUpIcon />,
  },
  {
    text: "Hồ sơ thể lực",
    path: "/profile",
    icon: <PersonIcon />,
  },
];

export default function Sidebar({ mobileOpen, onMobileClose, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavClick = (path) => {
    navigate(path);
    if (onMobileClose) onMobileClose();
  };

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "#FFFFFF" }}>
      {/* Navigation List */}
      <List sx={{ px: 1.5, pt: 2, flexGrow: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path === "/dashboard" && location.pathname === "/");

          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => handleNavClick(item.path)}
                sx={{
                  borderRadius: 2.5,
                  py: 1.3,
                  px: 2,
                  bgcolor: isActive ? "#DCFCE7" : "transparent",
                  color: isActive ? "#15803D" : "#4B5563",
                  transition: "all 0.15s ease-in-out",
                  "&:hover": {
                    bgcolor: isActive ? "#DCFCE7" : "#F3F4F6",
                    color: isActive ? "#15803D" : "#1F2937",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? "#16A34A" : "#6B7280",
                    minWidth: 38,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 700 : 500,
                    fontSize: "0.95rem",
                  }}
                />
                {item.badge && (
                  <Chip
                    label={item.badge}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: "0.62rem",
                      fontWeight: 800,
                      bgcolor: isActive ? "#16A34A" : "#ECFDF5",
                      color: isActive ? "#FFFFFF" : "#059669",
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: "#E5E7EB", mx: 2 }} />

      {/* Sleek Logout Button at Bottom */}
      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={onLogout}
          sx={{
            borderRadius: 2.5,
            py: 1.2,
            px: 2,
            color: "#6B7280",
            transition: "all 0.15s ease",
            "&:hover": {
              bgcolor: "#FEE2E2",
              color: "#DC2626",
              "& .MuiListItemIcon-root": {
                color: "#DC2626",
              },
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 38, color: "#9CA3AF" }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary="Đăng xuất"
            primaryTypographyProps={{
              fontWeight: 600,
              fontSize: "0.95rem",
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: DRAWER_WIDTH,
            borderRight: "1px solid #E5E7EB",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: DRAWER_WIDTH,
            borderRight: "1px solid #E5E7EB",
            top: 56,
            height: "calc(100vh - 56px)",
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
}
export { DRAWER_WIDTH };
