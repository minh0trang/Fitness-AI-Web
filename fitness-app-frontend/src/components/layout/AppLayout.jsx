import React, { useState } from "react";
import { Box } from "@mui/material";
import Navbar from "./Navbar";
import Sidebar, { DRAWER_WIDTH } from "./Sidebar";

export default function AppLayout({ children, user, onLogout, needsOnboarding }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", maxHeight: "100vh", overflow: "hidden", bgcolor: "#F7F8FA" }}>
      {/* Top Navbar */}
      <Navbar
        onMobileMenuToggle={handleDrawerToggle}
        user={user}
        onLogout={onLogout}
      />

      <Box sx={{ display: "flex", flexGrow: 1, minHeight: 0, overflow: "hidden" }}>
        {/* Left Sidebar */}
        <Sidebar
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
          onLogout={onLogout}
          needsOnboarding={needsOnboarding}
        />

        {/* Main Content Area */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 1, md: 1.25 },
            width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
            height: "100%",
            minHeight: 0,
            overflowY: "auto",
            maxWidth: 1400,
            mx: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
