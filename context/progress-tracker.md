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
  - Configured `handleRegister` in `App.jsx` ([App.jsx](file:///d:/Fitness-AI-Web/fitness-app-frontend/src/App.jsx)) utilizing PKCE with `prompt: "create"` to route straight to Keycloak registration with automatic token exchange upon completion.

## In Progress

- Connecting frontend Weekly Check-in flow to backend APIs and AI Gemini plan generation.

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
