# Zero Fitness

## Overview

Zero Fitness is a personalized fitness coaching platform that helps users create and follow workout plans based on their fitness goals, experience level, available training days, workout duration, and equipment.

The system uses AI to generate personalized workout plans, provides guided exercise instructions with YouTube videos, records workout completion and user feedback, and analyzes progress to provide personalized recommendations.

The project is designed to demonstrate a practical backend system using microservices, event-driven architecture, asynchronous communication, and AI integration.

## Goals

1. Allow users to create a personalized fitness profile and generate a workout plan based on their goals and available resources.

2. Allow users to follow their workout plan, view exercise instructions and videos, complete workouts, and provide feedback.

3. Track workout progress and use AI to analyze user activity and provide personalized recommendations.

4. Demonstrate practical use of microservices and event-driven architecture through asynchronous communication between services.

## Core User Flow (Weekly Adaptive AI Coaching Cycle)

The system operates on an iterative **Weekly Adaptive AI Coaching Cycle**, ensuring workout plans continuously adapt to the user's changing body metrics, actual performance, and weekly lifestyle constraints:

1. **Authentication**: User signs in or registers through Keycloak.

2. **Weekly Check-in & Profile Update**:
   - At onboarding and at the end of every 7-day cycle, the user submits their **Weekly Check-in**:
     - Basic metrics: Weight, Height, Age, Gender.
     - Body measurements: Chest, Waist, Hip (with specific focus tracking, e.g., waist reduction).
     - Activity level & Primary fitness goal.
     - **Special AI Preferences / Weekly Wishes** (e.g., knee joint pain relief, travel schedule with bodyweight only, schedule adjustments).

3. **Adaptive AI Weekly Plan Generation**:
   - The AI Service combines:
     - The user's newly updated metrics and aspirations.
     - Prior week's actual performance (completion rate, calories burned, perceived workout fatigue).
   - Generates an optimized, scientifically balanced **7-day Adaptive Workout Plan** tailored specifically for the upcoming week.

4. **Weekly Execution & Daily Tracking**:
   - The generated weekly routine is displayed on the Dashboard and Schedule pages.
   - User executes workouts, views guided exercise details with YouTube tutorials, sets, reps, and rest times.
   - Upon completing a workout, user submits completion status, duration, calories burned, and subjective feedback.
   - System publishes `WorkoutCompleted` event through RabbitMQ to update statistics in real-time.

5. **Cycle Renewal**:
   - After completing the week (or upon user check-in), the user reviews their weekly progress (calories, streak, waist/weight progress) and initiates the next weekly check-in to generate the subsequent week's plan.

## Features

### 1. Authentication & User Profile (Weekly Check-in Station)

- User registration and login using Keycloak with JWT authentication.
- Centralized Profile & Weekly Check-in Station (`ProfilePage.jsx`):
  - **Card 1: Chỉ số thể chất & Mục tiêu**:
    - Track physical measurements (weight, height, age, gender, bust, waist, hips).
    - Scientific rate calculations (BMR, TDEE, BMI, Calorie Deficit).
    - Activity level selector & Free-text wishes for AI Coach.
  - **Card 2: Cấu hình Lịch tập & Ràng buộc AI**:
    - Workout days selector (7 circular toggle chips T2–CN, unselected days = Rest Days).
    - Session duration selector (15–20 min, 30–45 min, 45–60 min).
    - **Cụm Hạn chế thể chất & Chấn thương (Physical Limitations)**: Multi-select negative keywords for injury prevention (knee, lower back, wrist, neck/shoulder, no jumping, standing only, beginner).
    - **Cụm Dụng cụ sẵn có (Available Equipment)**: Multi-select attribute filter for compatible exercises (bodyweight, yoga mat, resistance band, dumbbells, chair/wall, kettlebell, swiss ball).
  - Sticky bottom CTA bar with real-time configuration summary.

### 2. Adaptive AI Workout Plan Generation & Review (`AiPlanPage.jsx`)

- Dedicated AI Workout Plan Page at `/ai-plan` (Pure workout & movement focus, non-nutrition):
  - Radar scan pulse animation with sequential micro-copy (Objective analysis -> Video filtering -> 7-day schedule optimization).
  - AI Weekly Workout Plan Header with 1-line consolidated workout specifications:
    `🎯 Mục tiêu: Giảm vòng eo | 🏋️ Beginner · ⏱ 30–45 phút/buổi · 📅 5 buổi/tuần`.
  - Gentle, practical AI Coach recommendation box prioritizing Low-Impact and joint-safe routines.
  - Weekly Overview line directly above the day selector:
    `🗓️ Tuần này: 5 buổi · ~190 phút · Core · Lower Body · Full Body` (chartless, highly scannable).
  - 7-day interactive weekly plan breakdown with clear 3-dimensional workout metrics:
    `🎯 [Focus Area] · 🔥 [Intensity] · ⏱ [Duration] phút` (e.g. `🎯 Core · 🔥 Moderate · ⏱ 42 phút`).
  - Standard 3-phase structured workout sequence per session:
    - Clip 1 (Khởi động / Warm-up): 3–5 min joint activation & movement preparation.
    - Clip 2 (Bài tập chính / Main): 15–25 min targeted exercise (Cardio, HIIT, Pilates, Strength).
    - Clip 3 (Giãn cơ / Cool-down): 5–10 min heart rate recovery & muscle relaxation.
  - Actionable plan controls: "Áp Dụng Lịch Tập Này & Bắt Đầu", "Chỉnh Sửa Hồ Sơ & Cấu Hình", "AI Tạo Lại Lịch Khác".

### 3. Weekly Workout Plan & Schedule (`SchedulePage.jsx`)

- Full 100% width 1-week timeline bar (T2 to CN) with status chips (completed, today, upcoming, rest).
- Playlist header displays synchronized 3-metric summary (`🎯 Core · 🔥 Moderate · ⏱ 42 phút`).
- Multi-video playlist execution player supporting YouTube embeds.
- Rest day isolation with recovery guidance.
- Scrollable Workout Journal Dialog (`WorkoutJournalDialog.jsx`) with RPE difficulty (1-5), energy levels (1-5), physical safety pain survey (`PAIN_AREAS`), optional body check-in photo, and sticky action buttons.

### 4. Guided Workout & Execution

- Exercise checklist with step-by-step instructions and YouTube video integration.
- Real-time workout tracking (rest timer, active calories, playlist progression).
- Actionable completion flow with instant feedback logging.

### 5. Workout Feedback & Event Publishing

- Collects post-workout perceived difficulty (RPE) and physical fatigue notes.
- Publishes `WorkoutCompleted` event asynchronously via RabbitMQ.
- Stores historical records for AI longitudinal analysis.

### 6. Progress Analytics & Dashboard (`DashboardPage.jsx`)

- **Quick KPI Stats**: Weekly calories burned vs target, training minutes, completed workouts, and 7-day streak indicator.
- **Weekly Calorie Expenditure Bar Chart**: Full-width interactive chart with daily expenditure breakdown.
- **BMI & Health Assessment Widget (`BmiGaugeWidget.jsx`)**: Interactive gauge with dynamic needle, category color arcs (Underweight, Normal, Overweight, Obese), and healthy target weight recommendation.
- **Weekly Check-in CTA Banner**: Seamless shortcut to update metrics and trigger new weekly plan generation.

### 7. AI Coaching Insights & Deep Analysis

- Instant summary of weekly goals and focus areas.
- Detailed modal analysis: Macronutrient breakdown (protein, carb, fat), customized injury-prevention advice, and 4-week roadmap.

### 8. Event-Driven Communication

- Publishes business events through RabbitMQ:
  - `WorkoutCompleted`: Triggers progress accumulation and AI analytical caching.
  - `WeeklyCheckinSubmitted`: Triggers AI evaluation and prompt preparation for the upcoming week.
- Loose coupling across microservices for high scalability.

## Architecture

The system follows a microservices architecture with event-driven communication.

### Services

- **API Gateway**
  - Single entry point for frontend requests.
  - Routes requests to appropriate services.
  - Handles authentication and JWT validation.

- **User Service**
  - Manages user profiles and fitness information.
  - Provides user-related APIs.

- **Workout Service**
  - Manages workout plans, workouts, exercises, completion records, and feedback.
  - Publishes workout-related business events.

- **AI Service**
  - Integrates with Gemini.
  - Generates workout plans.
  - Analyzes workout progress and feedback.
  - Produces personalized recommendations.

### Communication

- **Synchronous communication**
  - Used when the frontend needs an immediate response.
  - Example: retrieving a workout plan or user profile.

- **Asynchronous communication**
  - Used for business events and background processing.
  - RabbitMQ is used as the message broker.
  - Example:
  
    `Workout Service`
    
    → `WorkoutCompleted`
    
    → `RabbitMQ`
    
    → `AI Service / Progress Processing`

### Authentication

- Keycloak is used as the Identity and Access Management system.

- OAuth 2.0 / OpenID Connect is used for authentication.

- JWT tokens are used to authenticate requests between the frontend and backend.

## Scope

### In Scope

- User authentication with Keycloak.

- Fitness profile management.

- AI-generated personalized workout plans.

- Multi-week workout schedule.

- Workout and exercise details.

- YouTube exercise tutorial integration using stored video IDs.

- Workout completion tracking.

- Workout feedback.

- Progress dashboard.

- AI-based progress analysis and recommendations.

- RabbitMQ-based event-driven communication.

- Basic error handling and input validation.

- Docker-based local development environment.

### Out of Scope

- Social features such as friends, followers, comments, or activity feeds.

- Nutrition and meal planning.

- Wearable device integration.

- Real-time workout tracking using sensors or cameras.

- Real-time chat with an AI coach.

- Payment and subscription systems.

- Push notifications.

- Advanced recommendation algorithms based on large-scale user data.

- Production cloud deployment.

- Full YouTube search/recommendation integration.

## Success Criteria

1. A user can register and sign in successfully using Keycloak.

2. A signed-in user can create and update their fitness profile.

3. A user can request a personalized workout plan based on their fitness profile.

4. The AI Service can generate a valid structured workout plan using Gemini.

5. A generated workout plan can be saved and displayed to the user.

6. A user can open a workout and view its exercises, sets, reps, rest time, and tutorial videos.

7. A user can mark a workout as completed and submit feedback.

8. Completing a workout publishes a `WorkoutCompleted` event to RabbitMQ.

9. At least one independent consumer successfully processes the `WorkoutCompleted` event.

10. The system stores workout completion history and displays basic progress statistics.

11. The AI Service can analyze workout history and feedback and return personalized recommendations.

12. The complete core flow works end-to-end:

    `Login`
    
    → `Fitness Profile`
    
    → `Generate Workout Plan`
    
    → `View Workout`
    
    → `Complete Workout`
    
    → `Publish Event`
    
    → `Process Event`
    
    → `Track Progress`
    
    → `AI Recommendation`