# Feature 02 — User Profile Sync & Mandatory Onboarding

## Goal

Build the end-to-end user synchronization, biometric profile persistence in `user-service` (PostgreSQL), and mandatory onboarding guard on the frontend:
1. When a user authenticates via Keycloak for the first time, auto-sync their account into `user-service`.
2. Persist comprehensive physical metrics and workout constraints using strict Java Enums (`Gender`, `ActivityLevel`, `FitnessGoal`, `PhysicalLimitation`, `EquipmentType`).
3. Enforce **Mandatory Onboarding**: If `isProfileCompleted == false`, lock the app navigation and require the user to fill their physical profile on `/profile` before unlocking the full application (`/dashboard`, `/schedule`, `/ai-plan`).

---

## Scope

### 1. Backend (`userservice` - Spring Boot 3 + PostgreSQL)
- **Enums Package (`com.fitness.userservice.model.enums`)**:
  - `Gender`: `MALE`, `FEMALE`, `OTHER`
  - `ActivityLevel`: `SEDENTARY`, `LIGHT`, `MODERATE`, `ACTIVE`, `VERY_ACTIVE`
  - `FitnessGoal`: `WEIGHT_LOSS`, `MUSCLE_GAIN`, `ENDURANCE`, `FLEXIBILITY`, `GENERAL_FITNESS`
  - `PhysicalLimitation`: `KNEE_PAIN`, `LOWER_BACK`, `WRIST_PAIN`, `NECK_SHOULDER`, `NO_JUMPING`, `STANDING_ONLY`, `BEGINNER`
  - `EquipmentType`: `BODYWEIGHT`, `YOGA_MAT`, `RESISTANCE_BAND`, `DUMBBELL`, `CHAIR_WALL`, `KETTLEBELL`, `SWISS_BALL`

- **Database Entity (`com.fitness.userservice.model.UserProfile`)**:
  - `id`: UUID (Primary Key)
  - `user`: `@OneToOne` with `User`
  - `gender`: `@Enumerated(EnumType.STRING) Gender`
  - `age`: `Integer`
  - `height`: `Double` (cm)
  - `weight`: `Double` (kg)
  - `chest`: `Double` (cm)
  - `waist`: `Double` (cm)
  - `hips`: `Double` (cm)
  - `activityLevel`: `@Enumerated(EnumType.STRING) ActivityLevel`
  - `fitnessGoal`: `@Enumerated(EnumType.STRING) FitnessGoal`
  - `customWishes`: `String` (length 1000)
  - `workoutDuration`: `String` ("15-20", "30-45", "45-60")
  - `selectedDays`: `@ElementCollection List<Integer>` (1=Monday ... 7=Sunday)
  - `limitations`: `@ElementCollection Set<PhysicalLimitation>`
  - `equipment`: `@ElementCollection Set<EquipmentType>`
  - `isProfileCompleted`: `Boolean` (default `false`)
  - `createdAt`, `updatedAt`: Timestamps

- **REST APIs (`UserController.java`)**:
  - `POST /api/users/sync`: Receives `{ keycloakId, email, firstName, lastName }`. Creates user if absent, returns profile status and `isProfileCompleted`.
  - `GET /api/users/profile`: Retrieves current user's profile and biometric stats.
  - `PUT /api/users/profile`: Validates and persists updated biometric stats, setting `isProfileCompleted = true`.

### 2. Frontend (`fitness-app-frontend` - React + MUI)
- **API Service (`src/services/userService.js`)**:
  - Connects to backend via Gateway `http://localhost:8080/api/users`.
  - Automatic `Bearer ${token}` injection in request headers.
- **Onboarding Guard & Navigation Locking (`App.jsx`, `Sidebar.jsx`, `Navbar.jsx`)**:
  - Upon Keycloak token resolution, dispatch `syncUser()`:
    - If `isProfileCompleted == false`:
      - Set `needsOnboarding = true`.
      - Automatically route user to `/profile`.
      - Disable navigation to `/dashboard`, `/schedule`, `/progress`.
      - Display a prominent Onboarding Banner atop `/profile`.
    - If `isProfileCompleted == true`:
      - Load real user metrics into global application state.
      - Unlock all routes and navigation items.
- **Form Submission (`ProfilePage.jsx`)**:
  - Connect "Lưu hồ sơ & Cập nhật chỉ số" button to `PUT /api/users/profile`.
  - Upon successful save, update `isProfileCompleted = true`, unlock full app, and offer 1-click navigation to `/ai-plan` to generate their personalized 7-day schedule.

---

## Acceptance Criteria
1. Backend compiles cleanly with Maven and starts up without schema migration errors in PostgreSQL.
2. All string choice fields in `UserProfile` strictly use Java Enums.
3. Newly registered Keycloak users hitting the app are automatically synced to PostgreSQL.
4. Users without completed profiles cannot access `/dashboard` or `/schedule` and are forced to `/profile`.
5. Submitting `/profile` saves real biometric data to PostgreSQL, marks `isProfileCompleted = true`, and unlocks the entire app.
