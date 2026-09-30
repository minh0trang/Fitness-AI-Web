# Feature 01 — UI Foundation

## Goal

Build the initial frontend UI structure for Zero Fitness using the existing React + Vite + MUI stack.

This feature focuses on UI foundation, navigation, state reactivity, and interactive mock experience.

---

## Scope

Build the basic application structure:

- App layout (`AppLayout.jsx`)
- Navbar with branding (`Navbar.jsx`)
- Sidebar with multi-route navigation (`Sidebar.jsx`)
- Routing via React Router (`App.jsx`)
- Responsive layout across desktop and mobile

The main pages:

- Login (`/login`)
- Dashboard (`/dashboard`)
- Lịch & Bài tập (`/schedule`)
- Kế hoạch AI (`/ai-plan`)
- Tiến độ (`/progress`)
- Hồ sơ thể lực (`/profile`)

---

## UI Structure

```text
App
├── Navbar
├── Sidebar
└── Main Content
    ├── Dashboard (`/dashboard`)
    ├── Lịch & Bài tập (`/schedule`)
    ├── Kế hoạch AI (`/ai-plan`)
    ├── Tiến độ (`/progress`)
    └── Hồ sơ thể lực (`/profile`)
```

Use the existing MUI theme and UI conventions defined in `ui-context.md`.

---

## Requirements

### Navigation

User should be able to navigate between all 5 main pages using the desktop sidebar and mobile drawer.
Sidebar items:
- **Tổng quan** (`/dashboard`)
- **Lịch & Bài tập** (`/schedule`)
- **Kế hoạch AI** (`/ai-plan`) [with "Mới" badge]
- **Tiến độ** (`/progress`)
- **Hồ sơ thể lực** (`/profile`)

### Dashboard (`DashboardPage.jsx`)

- 4 KPI cards (Calories burned, Active time, Completed workouts, 7-day streak).
- Full-width Weekly Calorie Expenditure bar chart with daily statistics.
- Interactive BMI Gauge Widget (`BmiGaugeWidget.jsx`) with dynamic needle, color arcs, and healthy weight recommendations.
- Weekly Check-in CTA banner.

### Schedule & Workouts (`SchedulePage.jsx`)

- 1-week timeline bar (T2 to CN) across 100% width.
- Multi-video playlist structure per workout day:
  - Clip 1: Khởi động (Warm-up 3–5 min)
  - Clip 2: Bài tập chính (Main 15–25 min)
  - Clip 3: Giãn cơ (Cool-down 5–10 min)
- Embedded YouTube player with theater mode, rest timer, and video completion toggle.
- Rest day isolation with recovery guidance.
- Workout journal dialog with feeling selector, rating, notes, and check-in photo.

### Kế hoạch AI (`AiPlanPage.jsx` at `/ai-plan`)

- Dedicated page for AI generated workout plan.
- Radar scan pulse animation with sequential micro-copy (2.4s).
- AI Coach Evaluation Banner (BMR, TDEE, Deficit target, pastel Coach advice).
- 7-day interactive weekly plan breakdown with 3 YouTube clips per session.
- Action controls: "Áp Dụng Lịch Tập Này & Bắt Đầu", "Chỉnh Sửa Hồ Sơ & Cấu Hình", "AI Tạo Lại Lịch Khác".

### Fitness Profile (`ProfilePage.jsx` at `/profile`)

- **Card 1: Chỉ số thể chất & Mục tiêu**:
  - Personal info (name, gender, age, height, weight).
  - Body measurements (bust, waist, hips).
  - Daily activity level.
  - Custom wishes & notes for AI Coach.
- **Card 2: Cấu hình Lịch tập & Ràng buộc AI**:
  - Workout days in week (7 circular toggle chips T2–CN).
  - Session duration single-choice chips (15–20p, 30–45p, 45–60p).
  - **Cụm 1: Hạn chế thể chất & Chấn thương (Physical Limitations)**: Multi-select negative keywords (`knee_pain`, `lower_back`, `wrist_pain`, `neck_shoulder`, `no_jumping`, `standing_only`, `beginner`).
  - **Cụm 2: Dụng cụ sẵn có (Available Equipment)**: Multi-select attribute filter (`bodyweight` default, `yoga_mat`, `resistance_band`, `dumbbell`, `chair_wall`, `kettlebell`, `swiss_ball`).
- Sticky bottom CTA bar with constraint counter and analysis trigger.

### Progress (`ProgressPage.jsx` at `/progress`)

- Summary of historical workout journal entries.
- Feeling icons, ratings, timestamps, and check-in photo gallery.

---

## Constraints

- Use React + Vite + MUI.
- Reuse existing components whenever possible.
- Do not introduce another UI framework.
- Keep UI components separate from business logic.

---

## Acceptance Criteria

- All required pages can be opened through navigation.
- Main layout works on desktop and reasonable mobile widths.
- UI follows `ui-context.md`.
- Existing shared components are reused where appropriate.
- Frontend builds successfully (`npm run build` with 0 errors).
- No unrelated functionality is broken.