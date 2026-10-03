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
import {
  syncUserWithBackend,
  getUserProfile,
  updateUserProfile,
} from "./services/userService";

export default function App() {
  const { token, tokenData, logIn, logOut } = useContext(AuthContext);
  const dispatch = useDispatch();

  // All unauthenticated visits require login/register first (guestMode initialized to false)
  const [guestMode, setGuestMode] = useState(false);

  // Mandatory Onboarding Guard: true if newly registered / no physical profile in DB yet
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // App-level state for user data
  const [schedule, setSchedule] = useState(DEFAULT_WEEKLY_SCHEDULE);
  const [profile, setProfile] = useState(DEFAULT_USER_PROFILE);
  const [journalEntries, setJournalEntries] = useState(INITIAL_JOURNAL_ENTRIES);

  // Shared AI Workout Configuration & Generated Plan
  const [scheduleConfig, setScheduleConfig] = useState({
    selectedDays: [1, 2, 4, 5, 7],
    duration: "30-45",
    limitations: ["knee_pain", "no_jumping"],
    equipment: ["bodyweight"],
    tags: ["knee_pain", "no_jumping", "bodyweight"],
  });
  const [aiPlan, setAiPlan] = useState(() =>
    generateAiWeeklyPlan({
      selectedDays: [1, 2, 4, 5, 7],
      duration: "30-45",
      limitations: ["knee_pain", "no_jumping"],
      equipment: ["bodyweight"],
      tags: ["knee_pain", "no_jumping", "bodyweight"],
      fitnessGoal: DEFAULT_USER_PROFILE.fitnessGoal,
      customWishes: DEFAULT_USER_PROFILE.customWishes,
    })
  );

  // Auto-sync user with backend PostgreSQL on authentication
  useEffect(() => {
    if (token && tokenData) {
      dispatch(setCredentials({ token, user: tokenData }));
      setGuestMode(false);

      // Perform backend synchronization
      syncUserWithBackend(token, tokenData).then((syncRes) => {
        if (syncRes) {
          if (!syncRes.isProfileCompleted) {
            // New user or incomplete profile -> Lock app and enforce Onboarding
            setNeedsOnboarding(true);
          } else {
            // Profile already completed -> Unlock full app and hydrate real profile
            setNeedsOnboarding(false);
            getUserProfile(token, tokenData.sub).then((dbProfile) => {
              if (dbProfile) {
                setProfile((prev) => ({
                  ...prev,
                  name: dbProfile.name || tokenData.name || prev.name,
                  age: dbProfile.age || prev.age,
                  gender: dbProfile.gender ? dbProfile.gender.toLowerCase() : prev.gender,
                  height: dbProfile.height || prev.height,
                  weight: dbProfile.weight || prev.weight,
                  bust: dbProfile.chest || prev.bust,
                  waist: dbProfile.waist || prev.waist,
                  hips: dbProfile.hips || prev.hips,
                  activityLevel: dbProfile.activityLevel ? dbProfile.activityLevel.toLowerCase() : prev.activityLevel,
                  fitnessGoal: dbProfile.fitnessGoal ? dbProfile.fitnessGoal.toLowerCase() : prev.fitnessGoal,
                  customWishes: dbProfile.customWishes || prev.customWishes,
                }));
                if (dbProfile.selectedDays && dbProfile.selectedDays.length > 0) {
                  setScheduleConfig((prev) => ({
                    ...prev,
                    selectedDays: dbProfile.selectedDays,
                    duration: dbProfile.workoutDuration || prev.duration,
                    limitations: dbProfile.limitations
                      ? Array.from(dbProfile.limitations).map((s) => s.toLowerCase())
                      : prev.limitations,
                    equipment: dbProfile.equipment
                      ? Array.from(dbProfile.equipment).map((s) => s.toLowerCase())
                      : prev.equipment,
                  }));
                }
              }
            });
          }
        }
      });
    }
  }, [token, tokenData, dispatch]);

  const isAuthenticated = Boolean(token) || guestMode;

  const handleLogout = () => {
    setGuestMode(false);
    setNeedsOnboarding(false);
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
          userRating: entry.difficulty || entry.rating,
          userDifficulty: entry.difficulty,
          userHasPain: entry.hasPain,
          userPainLocations: entry.painLocations,
          userFeeling: entry.feeling,
          userNote: entry.notes,
        };
      }
      return next;
    });

    // 2. Prepend to journal entries
    setJournalEntries((prev) => [entry, ...prev]);
  };

  const handleSaveProfile = async (updatedProfile, updatedConfig) => {
    setProfile(updatedProfile);
    if (updatedConfig) {
      setScheduleConfig(updatedConfig);
    }
    // Profile is completed, unlock entire app
    setNeedsOnboarding(false);

    // Persist to backend PostgreSQL
    if (token && tokenData?.sub) {
      try {
        const payload = {
          name: updatedProfile.name,
          gender: updatedProfile.gender,
          age: Number(updatedProfile.age),
          height: Number(updatedProfile.height),
          weight: Number(updatedProfile.weight),
          chest: Number(updatedProfile.bust),
          waist: Number(updatedProfile.waist),
          hips: Number(updatedProfile.hips),
          activityLevel: updatedProfile.activityLevel,
          fitnessGoal: updatedProfile.fitnessGoal,
          experience: updatedProfile.experience,
          workoutPreferences: updatedProfile.workoutPreferences,
          customWishes: updatedProfile.customWishes,
          workoutDuration: updatedConfig?.duration || scheduleConfig.duration,
          selectedDays: updatedConfig?.selectedDays || scheduleConfig.selectedDays,
          limitations: updatedConfig?.limitations || scheduleConfig.limitations,
          equipment: updatedConfig?.equipment || scheduleConfig.equipment,
        };
        await updateUserProfile(token, tokenData.sub, payload);
      } catch (err) {
        console.warn("Failed to persist profile to backend:", err?.message);
      }
    }
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
            needsOnboarding={needsOnboarding}
          >
            <Routes>
              {/* If user needs onboarding, lock out dashboard and force /profile */}
              {needsOnboarding ? (
                <>
                  <Route
                    path="/profile"
                    element={
                      <ProfilePage
                        profile={profile}
                        onSaveProfile={handleSaveProfile}
                        scheduleConfig={scheduleConfig}
                        onUpdateScheduleConfig={setScheduleConfig}
                        setAiPlan={setAiPlan}
                        needsOnboarding={true}
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
                  <Route path="*" element={<Navigate to="/profile" replace />} />
                </>
              ) : (
                <>
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
                        needsOnboarding={false}
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
                </>
              )}
            </Routes>
          </AppLayout>
        )}
      </Router>
    </ThemeProvider>
  );
}