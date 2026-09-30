Redesign the Dashboard UI based on the current implementation and screenshot.

The current Dashboard has too much visual weight in some cards and too much empty space in others.

Do NOT add new functionality or change backend/data logic.

## Main design goal

Make the Dashboard feel like a coherent fitness analytics dashboard.

The page should communicate:

1. Quick weekly status
2. Fitness trends
3. Today's workout
4. Current body metrics

## Layout

### Row 1 — Quick Stats

Keep 4 compact KPI cards:

- Calories
- Training Time
- Workouts
- Streak

Make all four cards visually consistent.

Each card should contain:
- small visualization
- label
- main value
- supporting value

Use consistent height, padding, typography, and border style.

Examples:
- Calories → circular progress
- Training Time → progress bar
- Workouts → circular progress
- Streak → 7-day activity indicator

Do not make these cards visually heavy.

---

### Row 2 — Main Analytics

Use a 60/40 layout.

Left:
Calories Burned bar chart

Right:
Weight Progress line chart

These are the two primary analytics visualizations.

Give them more visual importance than the KPI cards.

Do not duplicate the same information unnecessarily.

---

### Row 3 — Daily Activity + Body Metrics

Use a 60/40 layout.

Left:
Today's Workout

Show:
- workout title
- calories
- duration
- completion progress
- exercise checklist
- CTA button

Keep this card compact.

Right:
Body Metrics

DO NOT use a huge BMI gauge.

Instead create a compact body metrics visualization containing:

- BMI: 20.2
- Weight: 70.5 kg
- Height: 162 cm
- Waist: 65 cm
- Waist goal: 62 cm

Use small metric blocks and a progress bar for the waist goal.

The Body Metrics card should use the available space efficiently.

---

## Remove the large BMI gauge

The current BMI gauge occupies too much space relative to the amount of information it provides.

Replace it with a compact "Body Metrics" card.

---

## Visual Design

Use one unified card style:

- white background
- #E5E7EB border
- 16px border radius
- subtle shadow only if necessary
- consistent padding
- no colored card borders

Use green as the primary accent.

Use blue/orange only when they communicate a specific data meaning.

Avoid:
- excessive green backgrounds
- multiple colored borders
- excessive gradients
- glow effects
- glassmorphism
- unnecessary decorative elements

---

## Spacing

Use a consistent spacing system.

Avoid:
- huge empty spaces
- overly tall cards
- vertically centered content inside sparse cards
- inconsistent card heights

Charts should have enough height to be readable but should not dominate the entire screen.

---

## Visual Hierarchy

Priority:

1. Main analytics charts
2. Today's workout / body metrics
3. Quick KPI cards

The eye should naturally move:

Quick Stats
→ Calories / Weight trends
→ Today's workout / Body metrics

---

## Important

Inspect the existing Dashboard implementation before changing it.

Reuse existing components and chart components where possible.

Do not rewrite working business logic.

Do not introduce new libraries.

Do not change APIs or data models.

Only restructure and refine the existing UI.

After implementation, verify:
- desktop layout
- responsive layout
- consistent card heights
- no excessive empty space
- no duplicated information
- no horizontal overflow