import React, { useContext, useEffect, useState } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { AuthContext } from "react-oauth2-code-pkce";
import { useDispatch } from "react-redux";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import theme from "./theme/theme";
import { setCredentials } from "./store/authSlice";
import AppLayout from "./components/layout/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import SchedulePage from "./pages/SchedulePage";
import ProgressPage from "./pages/ProgressPage";
import ProfilePage from "./pages/ProfilePage";
import AiPlanPage from "./pages/AiPlanPage";
import LoginPage from "./pages/LoginPage";
import {
  DEFAULT_WEEKLY_SCHEDULE,
  DEFAULT_USER_PROFILE,
  INITIAL_JOURNAL_ENTRIES,
  generateAiWeeklyPlan,
} from "./data/mockWorkouts";

export default function App() {
  const { token, tokenData, logIn, logOut } = useContext(AuthContext);
  const dispatch = useDispatch();

  // All unauthenticated visits require login/register first (guestMode initialized to false)
  const [guestMode, setGuestMode] = useState(false);

  // App-level state for mock reactivity
  const [schedule, setSchedule] = useState(DEFAULT_WEEKLY_SCHEDULE);
  const [profile, setProfile] = useState(DEFAULT_USER_PROFILE);
  const [journalEntries, setJournalEntries] = useState(INITIAL_JOURNAL_ENTRIES);

  // Shared AI Workout Configuration & Generated Plan
  const [scheduleConfig, setScheduleConfig] = useState({
    selectedDays: [1, 2, 4, 5, 7],
    duration: "30-45",
    limitations: ["knee_pain", "no_jumping"],
    equipment: ["bodyweight", "yoga_mat"],
    tags: ["knee_pain", "no_jumping", "bodyweight", "yoga_mat"],
  });
  const [aiPlan, setAiPlan] = useState(() =>
    generateAiWeeklyPlan({
      selectedDays: [1, 2, 4, 5, 7],
      duration: "30-45",
      limitations: ["knee_pain", "no_jumping"],
      equipment: ["bodyweight", "yoga_mat"],
      tags: ["knee_pain", "no_jumping", "bodyweight", "yoga_mat"],
      fitnessGoal: DEFAULT_USER_PROFILE.fitnessGoal,
      customWishes: DEFAULT_USER_PROFILE.customWishes,
    })
  );

  useEffect(() => {
    if (token) {
      dispatch(setCredentials({ token, user: tokenData }));
      setGuestMode(false);
    }
  }, [token, tokenData, dispatch]);

  const isAuthenticated = Boolean(token) || guestMode;

  const handleLogout = () => {
    setGuestMode(false);
    if (token) {
      logOut();
    }
  };

  const handleCompleteWorkout = (dayIndex, entry) => {
    // 1. Update schedule status
    setSchedule((prev) => {
      const next = [...prev];
      if (next[dayIndex]) {
        next[dayIndex] = {
          ...next[dayIndex],
          status: "completed",
          completedDate: new Date().toISOString(),
          userRating: entry.rating,
          userFeeling: entry.feeling,
          userNote: entry.notes,
        };
      }
      return next;
    });

    // 2. Prepend to journal entries
    setJournalEntries((prev) => [entry, ...prev]);
  };

  const handleSaveProfile = (updatedProfile) => {
    setProfile(updatedProfile);
  };

  const handleLogin = () => {
    // Standard Keycloak OAuth2 login
    logIn();
  };

  const handleRegister = () => {
    // Initiate Keycloak OIDC registration flow with prompt=create to directly open the register page
    logIn(undefined, { prompt: "create" });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        {!isAuthenticated ? (
          <LoginPage
            onLogin={handleLogin}
            onRegister={handleRegister}
            onGuestEnter={() => setGuestMode(true)}
          />
        ) : (
          <AppLayout
            user={tokenData || { name: profile.name, preferred_username: profile.name }}
            onLogout={handleLogout}
          >
            <Routes>
              <Route
                path="/dashboard"
                element={
                  <DashboardPage
                    schedule={schedule}
                    profile={profile}
                    journalEntries={journalEntries}
                  />
                }
              />
              <Route
                path="/schedule"
                element={
                  <SchedulePage
                    schedule={schedule}
                    onCompleteWorkout={handleCompleteWorkout}
                  />
                }
              />
              <Route
                path="/progress"
                element={<ProgressPage journalEntries={journalEntries} />}
              />
              <Route
                path="/profile"
                element={
                  <ProfilePage
                    profile={profile}
                    onSaveProfile={handleSaveProfile}
                    scheduleConfig={scheduleConfig}
                    onUpdateScheduleConfig={setScheduleConfig}
                    setAiPlan={setAiPlan}
                  />
                }
              />
              <Route
                path="/ai-plan"
                element={
                  <AiPlanPage
                    profile={profile}
                    scheduleConfig={scheduleConfig}
                    aiPlan={aiPlan}
                    setAiPlan={setAiPlan}
                    onApplySchedule={(newSchedule) => setSchedule(newSchedule)}
                  />
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AppLayout>
        )}
      </Router>
    </ThemeProvider>
  );
}