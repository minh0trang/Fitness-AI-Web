# Progress Tracker

## Current Phase

- In progress (Phase 1: Frontend UI Foundation & Weekly Adaptive AI Architecture Refactoring)

## Current Goal

- Finalize UI consistency and align user flow with Weekly Adaptive AI Coaching Cycle (Weekly Check-in, Dynamic Plan Generation, Real-time execution tracking).

## Completed

- **Brand & Theme Identity**:
  - Rebranded application to **Zero Fitness**.
  - Natural borderless logo presentation with smooth background blending.
- **Dashboard Optimization**:
  - Row 1: 4 unified KPI cards (`#E5E7EB` border, `16px` radius, Calories, Time, Workouts, Streak).
  - Row 2: Expanded Weekly Calories Burned chart for balanced visual weight.
  - Row 3: Integrated interactive BMI Gauge Widget (`BmiGaugeWidget.jsx`) with dynamic needle, category color bands, and healthy target weight calculations.
- **Schedule & Workout Player (`SchedulePage.jsx`)**:
  - Clean 1-week timeline bar (T2 to CN) across 100% width.
  - Standardized multi-video workout structure per active day:
    - Clip 1 (Khởi động / Warm-up): 3–5 min joint activation.
    - Clip 2 (Bài tập chính / Main): 15–25 min targeted training.
    - Clip 3 (Giãn cơ / Cool-down): 5–10 min recovery & heart rate cooldown.
  - Proper rest day isolation with dedicated recovery advice.
- **Fitness Profile & Constraints Station (`ProfilePage.jsx`)**:
  - Removed static reports and extraneous goal progress bars to streamline user input.
  - **Card 1: Chỉ số thể chất & Mục tiêu**: Name, Gender, Age, Height, Weight, Bust, Waist, Hips, Activity level, Custom wishes for AI Coach.
  - **Card 2: Cấu hình Lịch tập & Ràng buộc AI**:
    - 7-day workout toggle chips `[T2] [T3] [T4] [T5] [T6] [T7] [CN]`.
    - Session duration single-choice options (`15-20p`, `30-45p`, `45-60p`).
    - **Cụm 1: Hạn chế thể chất & Chấn thương (Physical Limitations)**: Multi-select negative keywords (`knee_pain`, `lower_back`, `wrist_pain`, `neck_shoulder`, `no_jumping`, `standing_only`, `beginner`).
    - **Cụm 2: Dụng cụ sẵn có (Available Equipment)**: Multi-select attribute filter (`bodyweight` default, `yoga_mat`, `resistance_band`, `dumbbell`, `chair_wall`, `kettlebell`, `swiss_ball`).
  - Sticky bottom CTA bar with real-time constraint metrics and analysis trigger.
- **Dedicated AI Plan Page (`AiPlanPage.jsx` at `/ai-plan`)**:
  - Dedicated route `/ai-plan` with sidebar navigation link **✨ Kế hoạch AI** (with "Mới" badge).
  - High-tech Radar scan pulse animation with sequential micro-copy (BMR/TDEE calculation -> Video filtering -> 7-day schedule optimization).
  - AI Coach evaluation banner with BMR (~1,320 kcal), TDEE (~1,815 kcal), Calorie Deficit recommendation, and pastel Coach advice box.
  - 7-day interactive schedule view with 3 YouTube clips per session.
  - Action workflow: "Áp Dụng Lịch Tập Này & Bắt Đầu" (applies to schedule and navigates to `/schedule`), "Chỉnh Sửa Hồ Sơ & Cấu Hình" (returns to `/profile`), "AI Tạo Lại Lịch Khác" (re-runs analysis).
- **Authentication & User Registration Flow (Keycloak IAM)**:
  - Enabled realm-level user registration (`registrationAllowed=true`) in `zero-fitness`.
  - Added dedicated "Tạo Tài Khoản Mới (Đăng Ký)" button in `LoginPage.jsx` ([LoginPage.jsx](file:///d:/Fitness-AI-Web/fitness-app-frontend/src/pages/LoginPage.jsx)).
- **Feature 02: User Profile Sync & Mandatory Onboarding**:
  - Defined strict Java Enums: `Gender`, `ActivityLevel`, `FitnessGoal` (with `FAT_LOSS` & `STRENGTH`), `ExperienceLevel`, `WorkoutPreference`, `PhysicalLimitation`, `EquipmentType`.
  - Built `UserProfile` JPA Entity in `userservice` with one-to-one mapping, collection tables (`user_selected_days`, `user_limitations`, `user_equipment`, `user_workout_preferences`), and training experience.
  - Implemented `POST /api/users/sync`, `GET /api/users/{keycloakId}/profile`, and `PUT /api/users/{keycloakId}/profile`.
  - Created `userService.js` for API integration via API Gateway.
  - Built Onboarding Guard in `App.jsx`, `Sidebar.jsx`, and `ProfilePage.jsx` locking app access until initial profile is completed.
  - Synchronized all newly refined fields from `ProfilePage.jsx`: `experience` (BEGINNER/INTERMEDIATE/ADVANCED), `workoutPreferences` (STRENGTH, CARDIO, YOGA, PILATES, MOBILITY, HIIT), and `FitnessGoal` mapping.
  - **Automated Testing Suite (100% Passed)**:
    - [UserServiceTest.java](file:///d:/Fitness-AI-Web/userservice/src/test/java/com/fitness/userservice/service/UserServiceTest.java): 5 unit tests covering new user creation, profile update with experience & preferences, biometrics calculation, and error handling.
    - [UserControllerTest.java](file:///d:/Fitness-AI-Web/userservice/src/test/java/com/fitness/userservice/controller/UserControllerTest.java): 3 WebMvc tests with MockMvc verifying `/sync`, `GET /profile`, and `PUT /profile` HTTP responses and JSON payloads.
    - Total: **8/8 tests passed** with JUnit 5 & Surefire.
- **UI Flow Alignment & Workout-Centric Architecture (Latest)**:
  - **Non-Nutrition Pivot & Header Specs (`AiPlanPage.jsx`)**:
    - Removed nutrition/metabolic calorie chips (`BMR / TDEE / Khuyến nghị calo`) from the AI Plan Header as the platform focuses purely on workout execution, physical conditioning, and movement rather than nutrition.
    - Consolidated workout specs into a clean single-row header:
      `🎯 Mục tiêu: Giảm vòng eo  |  🏋️ Beginner · ⏱ 30–45 phút/buổi · 📅 5 buổi/tuần`.
  - **Weekly Overview Summary (`AiPlanPage.jsx`)**:
    - Added a sleek single-line weekly overview directly above the 7-day selector without cluttered charts:
      `Tuần này: 5 buổi · ~190 phút · Core · Lower Body · Full Body`.
  - **3-Dimensional Per-Workout Intensity & Muscle Focus (`AiPlanPage.jsx` & `SchedulePage.jsx`)**:
    - Created shared helper `getWorkoutDayMeta(day)` in `mockWorkouts.js` extracting `{ focus, intensity, minutes }`.
    - Day header renders prominent status chip: `🎯 Core · 🔥 Moderate · ⏱ 42 phút`.
    - Day selector buttons in 7-day bar show duration & intensity (`42p · Moderate`) instead of raw calorie approximations.
    - Synced playlist header on `SchedulePage.jsx` with the same `🎯 Core · 🔥 Moderate · ⏱ 42 phút` format.
  - **Medical Terminology Moderation**:
    - Replaced unverified medical claims with professional fitness coaching terms:
      - *"7 Ngày Chuẩn Y Khoa"* ➔ **AI Weekly Workout Plan (7 ngày)**
      - *"Cấu trúc chuẩn y khoa: Khởi động ➔ Bài chính ➔ Giãn cơ"* ➔ **Cấu trúc buổi tập: Khởi động → Bài chính → Giãn cơ**
      - *"bảo vệ tuyệt đối khớp gối"* ➔ *"giảm tối đa áp lực lên khớp gối theo thể trạng của bạn"*
      - *"Lời dặn của AI Coach"* ➔ *"Gợi ý từ AI Coach"*
    - Synced radar animation microcopy in `ProfilePage.jsx` and features in `LoginPage.jsx`.
  - **Workout Journal Dialog Overhaul (`WorkoutJournalDialog.jsx`)**:
    - Fixed undefined label bug on Difficulty (1-5 RPE Bolt icon) and Energy (1-5 Heart icon) options by removing nonexistent `.desc` accessors.
    - Implemented scrollable modal structure (`maxHeight: "90vh"` on Dialog Paper, `overflowY: "auto"` on `DialogContent` with custom styled slim scrollbar).
    - Fixed sticky bottom `DialogActions` footer so "Bỏ qua" and "Lưu Vào Nhật Ký" action buttons remain perpetually visible and clickable regardless of expanded photo uploads or long personal journal notes.
    - Integrated multi-dimensional feedback flow: RPE Difficulty, Energy level, Physical pain/discomfort survey (`PAIN_AREAS`), Optional Photo check-in, Personal notes, and Encouragement summary screen.
  - **Profile Page UI Streamlining (`ProfilePage.jsx`)**:
    - Cleaned up verbose headers ("1. Thông tin cơ bản", "2. Mục tiêu tập luyện", "4. Chỉ số cơ thể").
    - Removed redundant chip tags to improve scanning readability.
  - **Progress Tracking & Workout Journal Heatmap (`ProgressPage.jsx` at `/progress`)**:
    - **Energy-Based Calendar Heatmap (Độ đậm nhạt theo Sức khỏe)**:
      - Each completed calendar day's background and border shade dynamically render based on post-workout health & vitality (`energy` scale 1-5):
        - `Level 1` (Kiệt sức): `#F0FDF4` (Xanh siêu nhạt)
        - `Level 2` (Khá mệt): `#DCFCE7`
        - `Level 3` (Bình thường): `#A7F3D0`
        - `Level 4` (Dồi dào): `#34D399`
        - `Level 5` (Bùng nổ): `linear-gradient(135deg, #10B981, #059669)` (Xanh ngọc lục bảo đậm rực rỡ)
      - Integrated interactive Legend bar displaying the 5 energy levels with visual swatches.
      - Live reactivity: automatically merges dynamic submissions from `journalEntries` into the calendar state in real time.
    - **Post-Workout Modal Mirroring (`Day Details Modal`)**:
      - Day detail modal when clicking any completed calendar day is 100% aligned with the post-workout journal dialog (`WorkoutJournalDialog.jsx`):
        - Workout banner with completion trophy, workout title, duration, and calories burned.
        - **Mức độ gắng sức (RPE)**: 1-5 lightning bolt scale with exact difficulty label.
        - **Sức khỏe & Năng lượng**: 1-5 heart scale with energy pill badge matching the day cell tone.
        - **Khảo sát chấn thương & Đau mỏi**: Status indicator and pain area tags (Khớp gối, Lưng dưới, Cổ chân, etc.).
        - **Ảnh Check-in**: Visual photo preview card if user uploaded progress photos.
        - **Nhật ký cá nhân**: User notes formatted in an elegant quote block.
        - Gợi ý từ AI Coach: Recovery and encouragement advice banner.
        - Scrollable dialog body with styled slim scrollbar and full responsive layout.
  - **Database Architecture & Data Models Specification ([context/database-design.md](file:///d:/Fitness-AI-Web/context/database-design.md))**:
    - Standardized Service boundaries: `userservice` (PostgreSQL), `activityservice` (MongoDB), `aiservice` (MongoDB).
    - Designed core adaptive loop: `Profile` + `WeeklyHistorySummary` (7 days aggregated metrics) ➔ `AIService` ➔ `WeeklyPlan` ➔ `Workout` ➔ `WorkoutJournal` (with `plannedDuration`, `plannedIntensity`, `energy` 1-5) ➔ Next Cycle.
    - Decoupled `AiPlanGeneration` (audit log of weekly plan generation) from `recommendations` (short post-workout coaching advice).
    - Specified key DTOs: `WeeklyHistorySummary`, `AiGeneratePlanRequest`, `WorkoutJournalRequest`, `MonthlyProgressResponse`.

## In Progress

- Connecting frontend Weekly Check-in flow to backend AI Gemini plan generation based on the active UI flow.

## Next Up

- Connect `ProfilePage` check-in submission to backend user/activity service.
- Integrate real YouTube Data API v3 search alongside Gemini plan generation.

## Architecture Decisions

- **Dedicated AI Plan Page Separation**: The AI suggested workout plan is hosted on a dedicated page (`AiPlanPage.jsx` at `/ai-plan`) rather than embedded into the profile form, providing a clean separation of concerns between input collection and plan review.
- **Dual Categorical Filtering (Negative vs. Attribute Filters)**: Injury restrictions and equipment availability are categorized into distinct clusters so the prompt/filtering algorithm treats limitations as exclusion criteria and equipment as condition criteria.
- **Weekly Adaptive Coaching Loop**: Workout plans are generated on a 7-day adaptive cycle rather than a rigid multi-week block. Each week begins with a check-in (metrics + user constraints) that informs the Gemini AI prompt to adapt the new week's plan.
- **Unified Card Design System**: All dashboard and profile cards strictly adhere to `#FFFFFF` background, `border: 1px solid #E5E7EB`, and `borderRadius: 16px`.

## Session Notes

- Frontend dev server running on Vite (`http://localhost:5173`).
- Clean build verified with `npm run build` (0 errors).
