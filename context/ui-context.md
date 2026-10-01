# UI Context

## Theme

Zero Fitness uses a clean, modern, and energetic fitness-focused visual language.

The interface should feel:
- Clean
- Friendly
- Motivating
- Professional
- Easy to scan during workouts

Use a light theme as the default.

The UI should prioritize readability and clear visual hierarchy over decorative elements.

Avoid excessive gradients, glowing effects, glassmorphism, or highly technical dashboard styling.

The application should feel like a modern fitness coaching product rather than an administrative system.

## Colors

Use centralized theme tokens through the MUI theme configuration.

Do not introduce arbitrary colors directly inside components when an existing theme token can be used.

| Role | Theme Token | Value |
| --------------- | ------------------------- | -------- |
| Page background | `background.default` | `#F7F8FA` |
| Surface | `background.paper` | `#FFFFFF` |
| Primary text | `text.primary` | `#1F2937` |
| Secondary text | `text.secondary` | `#6B7280` |
| Primary accent | `primary.main` | `#16A34A` |
| Primary accent hover | `primary.dark` | `#15803D` |
| Border | `divider` | `#E5E7EB` |
| Error | `error.main` | `#DC2626` |
| Success | `success.main` | `#16A34A` |
| Warning | `warning.main` | `#F59E0B` |
| Info | `info.main` | `#2563EB` |

### Color Rules

- Prefer MUI theme colors over hardcoded colors.

- Use the primary accent mainly for important actions and active states.

- Do not use the primary accent on every element.

- Error, warning, and success colors should communicate state rather than decoration.

- Maintain sufficient contrast between text and backgrounds.

- Do not introduce a new color without checking whether an existing theme token can be reused.

## Typography

Use a clean sans-serif font optimized for readability.

| Role | Font | Usage |
| --------- | ---------------- | ---------------- |
| UI text | Inter / system sans-serif | Main application text |
| Headings | Inter / system sans-serif | Page and section headings |
| Numbers | Inter / system sans-serif | Progress statistics and metrics |
| Code/mono | System monospace | Technical information when required |

### Typography Rules

- Use a clear hierarchy between page titles, section titles, body text, and secondary information.

- Page titles should be visually prominent but not oversized.

- Body text should remain comfortable to read.

- Avoid using more than two font families.

- Use font weight to communicate hierarchy rather than excessive font-size differences.

## Border Radius

Use consistent rounded corners throughout the application.

| Context | Radius |
| ----------------- | -------- |
| Small controls | `8px` |
| Buttons / inputs | `8px` |
| Cards / panels | `12px` |
| Large feature cards | `16px` |
| Modals / dialogs | `12px` |

Avoid excessive pill-shaped UI unless the element represents a tag, status, filter, or compact category.

## Component Library

Use **MUI (Material UI)** as the primary component library.

Prefer existing MUI components before creating custom components.

Common components include:

- `Button`
- `Card`
- `CardContent`
- `TextField`
- `Select`
- `Chip`
- `Dialog`
- `Modal`
- `Tabs`
- `LinearProgress`
- `CircularProgress`
- `Alert`
- `Avatar`
- `IconButton`
- `Tooltip`

Shared custom components should be created only when:
- The UI pattern is reused.
- The component provides meaningful domain-specific behavior.
- MUI alone does not provide the required abstraction.

Do not create duplicate versions of existing MUI components.

## Layout Patterns

### Application Shell

The main application uses:

    ┌──────────────────────────────────────────────┐
    │                  Navbar                      │
    ├──────────────┬───────────────────────────────┤
    │              │                               │
    │   Sidebar    │          Main Content         │
    │              │                               │
    │              │                               │
    └──────────────┴───────────────────────────────┘

- Navbar contains the application identity, user actions, and account access.

- Sidebar provides navigation between major application areas.

- Main content contains the current page.

- Sidebar should remain visually secondary to the main content.

### Dashboard

The dashboard provides a coherent, 3-tier fitness analytics and daily activity hub:

1. **Row 1 — Quick Stats (4 KPI Cards)**:
   - Calories Burned ring
   - Training Time progress bar
   - Completed Workouts ring
   - Discipline Streak (7-day status indicators)
   - Unified style: `#FFFFFF` background, `#E5E7EB` border, `16px` border radius, consistent padding and height.

2. **Row 2 — Main Analytics (60/40 Layout)**:
   - Left (60%): Weekly Calories Burned bar chart with interactive day tooltips.
   - Right (40%): Weight Progress SVG trend line chart and target weight milestones.

3. **Row 3 — Daily Operations & Body Metrics (60/40 Layout)**:
   - Left (60%): Today's Workout status (exercises, calories, duration, completion progress, quick CTA to `/schedule`).
   - Right (40%): Compact Body Metrics card (BMI, Weight, Height, Waist, and Waist Goal Progress Bar).

Desktop layout uses zero-scroll geometry (`overflow: hidden`) with balanced vertical density.

### Workout Plan

### AI Workout Plan (`AiPlanPage.jsx`)

The dedicated AI Plan Page (`/ai-plan`) presents the adaptive 7-day routine with a pure workout focus (non-nutrition):

1. **Header Banner**:
   - Replaces nutrition/calorie stats with a single-row workout spec badge:
     `🎯 Mục tiêu: Giảm vòng eo  |  🏋️ Beginner · ⏱ 30–45 phút/buổi · 📅 5 buổi/tuần`
   - AI Coach Guidance box: Gentle, injury-prevention advice (Low-Impact, protecting joints).
2. **Weekly Overview Banner**:
   - Clean, chartless summary line above the day selector:
     `🗓️ Tuần này: 5 buổi · ~190 phút · Core · Lower Body · Full Body`
3. **7-Day Selector Bar**:
   - Interactive day pills showing day name, date, and 2-metric summary (`${duration}p · ${intensity}`, e.g., `42p · Moderate`).
4. **Day Routine & Multi-Video Flow**:
   - Status chip summarizing 3 dimensions: `🎯 [Focus Area] · 🔥 [Intensity] · ⏱ [Duration] phút` (e.g. `🎯 Core · 🔥 Moderate · ⏱ 42 phút`).
   - 3-Phase video progression cards:
     - Clip 1: Khởi động (Warm-up 3–5 min)
     - Clip 2: Bài tập chính (Main 15–25 min)
     - Clip 3: Giãn cơ (Cool-down 5–10 min)
   - Rest day isolation with dedicated recovery recommendations.

### Workout Detail & Execution (`SchedulePage.jsx`)

Prioritize the workout execution itself:
- Top 1-week timeline bar (T2 to CN) with status chips.
- Synchronized playlist header displaying `🎯 Core · 🔥 Moderate · ⏱ 42 phút`.
- Multi-video playlist alongside YouTube player with theater mode toggle and rest timer.

### Progress

Use visual summaries rather than large tables.

Recommended elements:
- Completed workouts
- Weekly completion rate
- Total workout time
- Recent workout history
- Progress trend
- AI recommendation

### Fitness Profile (Weekly Check-in Station)

The Fitness Profile functions as the **Weekly Physical Check-in Station** for the Adaptive AI Coaching loop:

- **Simplified, clean section titles**:
  1. *1. Thông tin cơ bản*: Name, Gender toggle, Age, Height, Weight.
  2. *2. Mục tiêu tập luyện*: Primary fitness goal single-choice.
  3. *3. Kinh nghiệm*: Training level (Beginner, Intermediate, Advanced).
  4. *4. Chỉ số cơ thể*: Bust, Waist, Hips.
  5. *Cấu hình Lịch tập & Ràng buộc AI*: 7-day selector, session duration, physical limitations (negative keywords), available equipment (attribute filters), custom wishes.

### Modals / Dialogs

Use MUI `Dialog` for confirmation or focused interactions:
- Have a clear title and concise description.
- Provide an obvious primary action and close action.
- **Workout Journal Dialog (`WorkoutJournalDialog.jsx`) Pattern**:
  - `maxHeight: "90vh"` with `overflow: "hidden"` on Paper.
  - `DialogContent` with `dividers` and `overflowY: "auto"` (styled slim scrollbar) so expanding photo upload or long notes never overflows the screen.
  - Pinned sticky bottom `DialogActions` (`flexShrink: 0`, top border) ensuring primary submission buttons ("Bỏ qua", "Lưu Vào Nhật Ký") remain perpetually visible.
  - Survey flow: RPE Difficulty (1-5), Energy level (1-5), Safety Pain Check (`PAIN_AREAS`), Optional Photo upload, and Personal notes.

## Responsive Design

The application should work on:

- Desktop
- Tablet
- Mobile

Desktop is the primary development target.

### Desktop

- Use a persistent sidebar where appropriate.
- Use a centered content area with a reasonable maximum width.
- Use multi-column layouts for dashboard cards and workout information.

### Mobile

- Collapse the sidebar into a mobile navigation pattern.
- Stack cards vertically.
- Keep primary actions easily reachable.
- Avoid horizontal scrolling unless the content genuinely requires it.

## Spacing

Use MUI's spacing system instead of arbitrary pixel values.

Prefer:

    theme.spacing(...)

over manually defining many different spacing values.

Use consistent spacing between:
- Page sections
- Cards
- Form fields
- Buttons
- Text blocks

Avoid tightly packed interfaces.

## Cards

Cards should be used to group related information.

Common card types:

- Progress summary
- Workout
- Exercise
- AI recommendation
- Fitness profile section

Cards should have:
- Clear hierarchy
- Consistent padding
- Subtle borders or elevation
- Consistent border radius

Avoid putting every piece of information into a separate card.

## Buttons

Use button hierarchy consistently.

### Primary Action

Use for the main action on a page.

Examples:

- Generate Workout Plan
- Start Workout
- Complete Workout
- Save Profile

### Secondary Action

Use for supporting actions.

Examples:

- Edit Profile
- View Details
- Cancel

### Destructive Action

Use only when an action can remove or permanently change data.

Examples:

- Delete Workout Plan
- Remove Data

Destructive actions should require confirmation when appropriate.

## Status Indicators

Use MUI `Chip`, icons, or text to represent states.

Examples:

- `Completed`
- `In Progress`
- `Upcoming`
- `Not Started`

Status should be understandable without relying only on color.

For example:

    ✓ Completed
    • In Progress
    ○ Upcoming

## Loading States

Every asynchronous operation should provide a visible loading state.

Examples:

- `CircularProgress` for small actions.
- Skeletons for page/card loading.
- Disabled button state while submitting forms.

Avoid showing a blank page while data is loading.

## Empty States

Empty states should explain:

1. What is currently missing.
2. Why it matters.
3. What the user can do next.

Example:

    No workout plan yet.

    Create your fitness profile and generate
    a personalized workout plan.

    [Generate My Plan]

Avoid empty screens with only "No data".

## Error States

Errors should be understandable to normal users.

Prefer:

    Unable to generate your workout plan.
    Please try again.

Instead of exposing:

    500 Internal Server Error
    NullPointerException
    AxiosError

Technical details should be logged for developers but not shown directly to users.

## Icons

Use **Material Icons / MUI Icons**.

Prefer simple icons that reinforce the meaning of the action.

Examples:

- `FitnessCenter`
- `CalendarMonth`
- `TrendingUp`
- `PlayArrow`
- `CheckCircle`
- `Person`
- `Settings`
- `Logout`
- `AutoAwesome`

Icon rules:

- Use icons together with text for important actions when possible.

- Do not use icons purely for decoration when they do not communicate useful information.

- Keep icon sizes consistent.

- Use `IconButton` when the icon itself represents the complete action.

## Images and YouTube Videos

Exercise-related images and videos should support the user's workout.

- Prefer real exercise imagery or YouTube thumbnails where appropriate.

- YouTube videos should be embedded using the stored video ID.

- Do not download or store YouTube video files.

- Video containers should maintain a consistent aspect ratio.

- Avoid autoplay unless explicitly required.

## AI Recommendation UI

AI-generated recommendations should be visually distinct but integrated into the normal application.

Use a simple card or section such as:

    AI Coach
    ─────────────────────────
    Based on your recent workouts...

    Recommendation content

Avoid excessive "AI" visual effects.

AI content should remain readable and should not visually dominate the user's actual workout data.

## Accessibility

- All interactive elements must be keyboard accessible.

- Inputs must have clear labels.

- Buttons should have understandable text or accessible labels.

- Do not rely only on color to communicate status.

- Maintain sufficient color contrast.

- Images should have meaningful `alt` text when they convey information.

## UI Consistency Rules

- Reuse existing components and theme tokens.

- Do not create a new visual style for each page.

- Keep buttons, cards, inputs, spacing, typography, and status indicators consistent.

- Do not introduce random colors, fonts, shadows, or border radii.

- Before creating a new component, check whether an existing component can be reused.

- Before creating a new visual pattern, check whether the same pattern already exists elsewhere in the application.

- The UI should feel like one product, not a collection of independently generated pages.

## AI Coding Agent UI Rules

When implementing or modifying frontend UI:

1. Inspect existing components before creating new ones.

2. Reuse MUI components and existing shared components whenever possible.

3. Follow the existing theme and spacing system.

4. Do not introduce Tailwind, shadcn/ui, Bootstrap, or another UI framework.

5. Do not add a new icon library if MUI Icons already satisfies the requirement.

6. Do not hardcode random colors or spacing values when theme tokens can be used.

7. Do not redesign unrelated pages while implementing a feature.

8. Keep responsive behavior in mind when creating new layouts.

9. Preserve existing navigation and application structure unless the requested feature requires a change.

10. If a UI requirement is ambiguous, prefer the simplest design consistent with the existing application.

11. Prioritize usability and clarity over visual complexity.

12. Do not add animations or decorative effects unless they improve usability.