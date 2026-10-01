# Zero Fitness — Implementation Plan

## 1. Mục tiêu

Triển khai hệ thống Zero Fitness theo từng feature nhỏ, đảm bảo mỗi feature:

1. Có dependency rõ ràng.
2. Có thể chạy và test độc lập.
3. Không implement logic chưa cần thiết.
4. Không để AI tự phát minh behavior hoặc database structure.
5. Hoàn thành Core Adaptive Loop trước khi mở rộng các tính năng phụ.

---

# 2. Core Architecture

```text
UserService
    │
    │ UserProfile
    ▼
ActivityService
    │
    ├── WeeklyPlan
    ├── WorkoutJournal
    │
    └── WeeklyHistorySummary
              │
              ▼
         AIService
              │
              ├── Gemini
              └── AiPlanGeneration
              │
              ▼
         WeeklyPlan mới
              │
              ▼
         ActivityService
```

Core Adaptive Loop:

```text
User Profile
     ↓
Generate Weekly Plan
     ↓
User performs workouts
     ↓
Workout Journal
     ↓
Weekly History Summary
     ↓
Gemini AI
     ↓
New Adaptive Weekly Plan
```

---

# 3. Implementation Order

## F01 — User Profile Contract

### Goal

Đảm bảo ActivityService/AIService có thể nhận được thông tin profile cần thiết để tạo workout plan.

### Scope

* Kiểm tra `users`
* Kiểm tra `user_profiles`
* Kiểm tra các ElementCollection:

  * selected days
  * workout preferences
  * limitations
  * equipment
* Hoàn thiện `UserProfileDto`

### Required data

```text
gender
age
height
weight
waist
fitnessGoal
experience
workoutPreferences
selectedDays
workoutDuration
limitations
equipment
customWishes
```

### Test

* Get profile thành công.
* Profile chưa hoàn thành được nhận diện đúng.
* DTO chứa đầy đủ thông tin cần cho AI.

### Done when

`UserProfileDto` có thể được sử dụng làm input cho AI plan generation.

---

# F02 — WeeklyPlan Domain

### Goal

Xây dựng domain lưu kế hoạch tập tuần.

### Scope

ActivityService:

```text
WeeklyPlan
WorkoutDay
WorkoutExercise
```

MongoDB:

```text
weekly_plans
```

### Required behavior

* Create WeeklyPlan.
* Get active WeeklyPlan.
* Get WeeklyPlan theo user.
* Xác định ngày REST/WORKOUT.
* Không lưu `status` tĩnh cho WorkoutDay.

### Test

```text
Create Plan
    ↓
Save MongoDB
    ↓
Get Active Plan
    ↓
Verify structure
```

### Done when

Có thể tạo và đọc một WeeklyPlan hoàn chỉnh mà chưa cần Gemini.

---

# F03 — WorkoutJournal

### Goal

Lưu kết quả thực tế sau mỗi workout.

### Scope

Entity:

```text
WorkoutJournal
```

Collection:

```text
workout_journals
```

API:

```http
POST /api/workout-journals
```

### Required data

```text
planId
dayIndex
workoutTitle
actualDurationMinutes
plannedDurationMinutes
plannedIntensity
caloriesBurned
difficulty
energy
hasPain
painLocations
notes
photoUrl
```

### Validation

* `planId` tồn tại.
* `dayIndex` hợp lệ.
* `difficulty`: 1–5.
* `energy`: 1–5.
* Nếu `hasPain = false` → `painLocations` phải rỗng.
* Không lưu image binary trong MongoDB.

### Test

```text
WeeklyPlan
    ↓
POST WorkoutJournal
    ↓
MongoDB
    ↓
GET Journal
```

### Done when

Có thể hoàn thành một workout và lưu journal thành công.

---

# F04 — WeeklyHistorySummary

### Goal

Tổng hợp dữ liệu workout thành context nhỏ gọn cho AI.

### Input

```text
WorkoutJournal
```

### Output

```text
WeeklyHistorySummary
```

### Metrics

```text
totalScheduledDays
completedDays
completionRate
actualMinutes
targetMinutes
averageDifficulty
averageEnergy
painReports
focusDistribution
```

### Rules

Không gửi toàn bộ raw workout history cho Gemini.

Chỉ gửi summary cần thiết.

### Test cases

#### Case 1

Không có history:

```text
previousWeekSummary = null
```

#### Case 2

Có đầy đủ history:

```text
5 scheduled
4 completed
80% completion
168 actual minutes
```

#### Case 3

Có pain reports.

Kiểm tra pain được aggregate chính xác.

#### Case 4

Có nhiều workout focus.

Kiểm tra `focusDistribution`.

### Done when

ActivityService có thể tạo chính xác:

```text
WorkoutJournals
      ↓
WeeklyHistorySummary
```

---

# F05 — AI Weekly Plan Generation

## Goal

Tạo WeeklyPlan bằng Gemini.

### API

```http
POST /api/ai/plans/generate
```

### Input

```text
AiGeneratePlanRequest
```

Bao gồm:

```text
userProfile
previousWeekSummary
targetWeek
```

### First Week

Nếu user chưa có history:

```text
previousWeekSummary = null
```

AI chỉ dựa trên:

```text
UserProfile
+
TargetWeek
```

### AI output

AI phải trả về cấu trúc tương thích với:

```text
WeeklyPlanDto
```

### Important rule

Không tin tưởng raw AI response.

Flow:

```text
Gemini
   ↓
Raw Response
   ↓
Parse
   ↓
Validate
   ↓
WeeklyPlanDto
   ↓
ActivityService
```

### Validation

Kiểm tra:

* số ngày tập.
* selected days.
* duration.
* exercise phase.
* order.
* required fields.
* không vượt equipment.
* không vi phạm limitation.
* JSON structure hợp lệ.

### Test

#### Case 1 — First Plan

```text
Profile
+
null history
→
WeeklyPlan
```

#### Case 2 — Adaptive Plan

```text
Profile
+
PreviousWeekSummary
→
New WeeklyPlan
```

#### Case 3 — Invalid AI response

AI trả JSON sai.

Expected:

```text
Reject
+
Log error
+
Không lưu invalid plan
```

### Done when

Có thể tạo WeeklyPlan mới bằng Gemini và validate thành công.

---

# F06 — AI Plan Generation Audit

### Goal

Lưu lại thông tin mỗi lần AI tạo plan.

### Collection

```text
ai_plan_generations
```

### Store

```text
userId
planId
generatedAt
contextPeriod
metricsAtGeneration
coachSummary
adjustmentsMade
aiModel
promptVersion
```

### Important

`aiModel` phải lấy từ configuration/runtime.

Không hard-code model name trong entity.

### Test

Sau mỗi successful generation:

```text
Generate Plan
      ↓
Save WeeklyPlan
      ↓
Save AiPlanGeneration
```

Nếu generation thất bại:

```text
No invalid audit
```

---

# F07 — Post-workout Recommendation

### Goal

Tạo recommendation sau workout.

### Input

```text
WorkoutJournal
```

### Output

```text
Recommendation
```

### Collection

```text
recommendations
```

### Content

```text
recommendation
improvements
suggestions
safety
```

### Example flow

```text
WorkoutJournal
     ↓
AIService
     ↓
Gemini
     ↓
Recommendation
```

### Done when

User submit workout → nhận được recommendation.

---

# F08 — Event-Driven Workout Completion

### Goal

Decouple ActivityService và AIService.

### Event

```text
WorkoutCompletedEvent
```

### Flow

```text
Frontend
   ↓
ActivityService
   ↓
Save WorkoutJournal
   ↓
Publish Event
   ↓
RabbitMQ
   ↓
AIService
   ↓
Generate Recommendation
```

### Important

Database transaction và event publishing phải được xử lý cẩn thận.

Không để event được publish khi journal chưa được lưu thành công.

### Test

```text
Submit Workout
    ↓
Journal exists
    ↓
Event published
    ↓
AI receives event
    ↓
Recommendation created
```

---

# F09 — Progress API

### Goal

Cung cấp dữ liệu cho ProgressPage.

### API

```http
GET /api/progress/monthly?year=2026&month=10
```

### Response

```text
MonthlyProgressResponse
```

### Metrics

```text
totalWorkouts
totalMinutes
averageEnergy
days[]
```

### Dynamic status

Không lưu status trong database.

ActivityService tính:

```text
COMPLETED
TODAY
UPCOMING
REST
MISSED
```

dựa trên:

```text
WorkoutDay.date
+
WorkoutJournal
+
CurrentDate
```

### Done when

Frontend có thể render monthly progress mà không cần xử lý business logic phức tạp.

---

# F10 — Dashboard Integration

### Goal

Kết nối dữ liệu thật vào Dashboard.

### Dashboard metrics

```text
Weekly Goal
Calories Burned
Workout Minutes
Workout Count
Energy
Completion Rate
```

### Rule

Dashboard chỉ consume API.

Không duplicate business logic từ ActivityService.

---

# 4. Dependency Graph

```text
F01 User Profile
       │
       ▼
F02 WeeklyPlan
       │
       ▼
F03 WorkoutJournal
       │
       ▼
F04 WeeklyHistorySummary
       │
       ▼
F05 AI Plan Generation
       │
       ▼
F06 AI Audit
       │
       ├───────────────┐
       ▼               ▼
F07 Recommendation   F08 Event Driven
       │               │
       └───────┬───────┘
               ▼
        F09 Progress API
               │
               ▼
        F10 Dashboard
```

---

# 5. MVP Boundary

## Core MVP

Chỉ cần hoàn thành:

```text
F01
 ↓
F02
 ↓
F03
 ↓
F04
 ↓
F05
 ↓
F06
```

Khi đó project đã có một Adaptive AI Workout Loop hoàn chỉnh.

## Extended Features

Sau MVP mới làm:

```text
F07 Recommendation
F08 RabbitMQ
F09 Progress
F10 Dashboard
```

---

# 6. AI Coding Rules

AI không được implement nhiều feature cùng lúc.

Mỗi feature phải follow:

```text
1. Read existing code
        ↓
2. Identify dependencies
        ↓
3. Explain implementation plan
        ↓
4. Identify ambiguities
        ↓
5. Wait for confirmation
        ↓
6. Implement
        ↓
7. Run tests
        ↓
8. Explain changes
        ↓
9. Wait for review
        ↓
10. Commit
        ↓
11. Update process/documentation
```

### Không được

* Tự tạo dependency nếu chưa cần.
* Tự thay đổi architecture.
* Tự thêm database field ngoài specification.
* Tự đổi API contract.
* Tự thay đổi business rule.
* Code toàn bộ project trong một lần.
* Bỏ qua test.
* Dùng AI output trực tiếp mà không validation.
* Đưa business logic vào Controller.

### Ưu tiên

```text
Simple
→ Testable
→ Explicit
→ Maintainable
→ Then optimize
```

---

# 7. Definition of Done

Một feature chỉ được xem là hoàn thành khi:

```text
[ ] Code implemented
[ ] Existing code inspected
[ ] API contract verified
[ ] Database behavior verified
[ ] Unit/integration tests passed
[ ] Error cases considered
[ ] No unnecessary dependency added
[ ] No architecture violation
[ ] User reviewed changes
[ ] Commit created
```

---

# 8. Recommended First Implementation

Bắt đầu từ:

```text
F01 — User Profile Contract
```

Không bắt đầu Gemini trước.

Mục tiêu đầu tiên:

```text
GET User Profile
       ↓
UserProfileDto
       ↓
Verify all AI-required fields
```

Sau khi F01 hoàn thành và test pass mới chuyển sang F02.
