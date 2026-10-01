# Feature Spec 06: F05 — AI Weekly Plan Generation

## 1. Mục Tiêu (Goal)

Xây dựng chu trình sinh Kế hoạch tập tuần mới (**`WeeklyPlan`**) thích ứng bằng Google Gemini AI, kết hợp bộ kiểm tra nghiêm ngặt (**Validator Engine**) và kho danh mục bài tập/video chuẩn hóa (**Exercise & Video Catalog**) được đặt trực tiếp tại `activityservice`.

---

## 2. Kiến Trúc Luồng Thực Thi Mới (Revised Flow)

```text
User Profile + History (WeeklyHistorySummary)
        │
        ▼
   [aiservice]
  Google Gemini
        │
        ▼
   Workout Plan (Mã bài tập: code, sets, reps, duration, phase)
        │
        ▼
 [activityservice]
  Validator Engine
        │ (Kiểm tra tồn tại, equipment, difficulty, rest/scheduled days)
        ▼
  Exercise Catalog (activityservice.exercises)
        │ (Tra cứu tên tiếng Việt, nhóm cơ, thông số chuẩn)
        ▼
   Video Catalog (activityservice.exercise_videos)
        │ (Tìm clip YouTube tương ứng phù hợp trình độ & dụng cụ)
        ▼
WeeklyPlan Preview (Xem trước trên /ai-plan trước khi user bấm Áp Dụng)
```

---

## 3. Hai (2) Model Mới Tại `activityservice` (Không Cần Video Service Riêng)

Cả hai model được đặt trực tiếp trong `activityservice` để truy vấn nội bộ tốc độ cao, không cần thêm microservice quản lý video riêng.

### 3.1. Entity `Exercise` (Collection: `exercises`)
Lưu danh mục các bài tập chuẩn hóa làm từ điển đối chiếu cho Gemini AI:

```json
{
  "_id": "ObjectId",
  "code": "PUSH_UP",
  "name": "Hít đất cơ bản",
  "focus": "Chest",
  "difficulty": "BEGINNER",
  "equipment": ["BODYWEIGHT"]
}
```
* `id` (`String` / ObjectId): Khóa chính.
* `code` (`String`, Unique Indexed): Mã bài tập chuẩn (uppercase snake_case như `PUSH_UP`, `SQUAT`, `GLUTE_BRIDGE`, `PLANK`...).
* `name` (`String`): Tên tiếng Việt hiển thị cho người dùng.
* `focus` (`String`): Nhóm cơ chính (`Chest`, `Back`, `Legs`, `Core`, `Shoulders`, `Full Body`, `Warmup`, `Cooldown`).
* `difficulty` (`String`): Mức độ (`BEGINNER`, `INTERMEDIATE`, `ADVANCED`).
* `equipment` (`List<String>`): Dụng cụ tối thiểu cần thiết (`BODYWEIGHT`, `DUMBBELL`, `YOGA_MAT`, `RESISTANCE_BAND`...).

### 3.2. Entity `ExerciseVideo` (Collection: `exercise_videos`)
Lưu kho clip video bài tập tương ứng:

```json
{
  "_id": "ObjectId",
  "exerciseId": "String (ObjectId liên kết exercises._id)",
  "title": "Hướng dẫn hít đất chuẩn form cho người mới",
  "youtubeUrl": "https://www.youtube.com/watch?v=IODxDxX7oi4",
  "thumbnailUrl": "https://img.youtube.com/vi/IODxDxX7oi4/hqdefault.jpg",
  "duration": 300,
  "level": "BEGINNER",
  "equipment": ["BODYWEIGHT"]
}
```
* `id` (`String` / ObjectId): Khóa chính.
* `exerciseId` (`String`): Khóa ngoại liên kết tới `exercises`.
* `title` (`String`): Tiêu đề video.
* `youtubeUrl` (`String`): Link video YouTube phát bài tập.
* `thumbnailUrl` (`String`): Ảnh đại diện thumbnail.
* `duration` (`Integer`): Thời lượng video (giây).
* `level` (`String`): Phù hợp trình độ (`BEGINNER`, `INTERMEDIATE`, `ADVANCED`).
* `equipment` (`List<String>`): Dụng cụ sử dụng trong video.

---

## 4. Nguyên Tắc Cốt Lõi: Gemini Không Chọn Video

1. **Gemini chỉ quyết định mã bài tập (`code`)**:
   - Gemini chỉ trả về mã chuẩn: `WARMUP_ARM_CIRCLES`, `PUSH_UP`, `SQUAT`, `PLANK`, `COOLDOWN_HAMSTRING_STRETCH`... cùng số sets, reps, thời lượng.
   - Gemini **không bao giờ trả URL video YouTube** (loại bỏ hoàn toàn rủi ro AI sinh link ảo 404, link video bị xóa hoặc không đúng bài tập).
2. **Backend tự tìm video trong kho**:
   - Dựa trên `exercise.code` ➔ Lấy `exerciseId`.
   - Tìm kiếm trong `ExerciseVideo` các clip có `exerciseId` khớp, ưu tiên video có `level` và `equipment` tương thích với `UserProfile` của người dùng.

---

## 5. Quy Tắc Kiểm Tra Của Validator (Validator Rules)

Sau khi nhận output từ Gemini và trước khi tạo `WeeklyPlan`, `AiPlanValidator` kiểm tra nghiêm ngặt 5 tiêu chí:

1. **Exercise có tồn tại không?**:
   - Mọi mã `code` do Gemini sinh ra bắt buộc phải tồn tại trong collection `exercises`.
   - Nếu mã lạ không tồn tại ➔ Validator từ chối hoặc fallback sang bài tập cơ bản cùng nhóm cơ.
2. **Equipment có phù hợp không?**:
   - Dụng cụ yêu cầu của bài tập (`exercise.equipment`) phải là tập con của dụng cụ người dùng có (`userProfile.equipment`).
   - Tuyệt đối không giao bài tập tạ (`DUMBBELL`) nếu user chỉ chọn `BODYWEIGHT`.
3. **Difficulty có phù hợp không?**:
   - Độ khó của bài tập không được vượt quá trình độ người dùng (ví dụ: User `BEGINNER` không được giao bài độ khó `ADVANCED`).
4. **Scheduled Day có bài tập không?**:
   - Các ngày thuộc `userProfile.selectedDays` bắt buộc có `isRestDay = false` và phải có đủ 3 pha: `WARMUP`, `MAIN`, `COOLDOWN`.
5. **Rest Day không có bài tập không?**:
   - Các ngày KHÔNG thuộc `selectedDays` bắt buộc có `isRestDay = true` và danh sách bài tập rỗng (`exercises = []`).

---

## 6. Cấu Trúc Request & Response

### Endpoint
`POST /api/ai/plans/generate` (Header: `X-User-ID: {keycloakId}`)

### Request Body: `AiGeneratePlanRequest`
```json
{
  "userProfile": {
    "gender": "FEMALE",
    "age": 24,
    "height": 162.0,
    "weight": 53.0,
    "waist": 65.0,
    "fitnessGoal": "FAT_LOSS",
    "experience": "BEGINNER",
    "workoutPreferences": ["CARDIO", "PILATES"],
    "selectedDays": [1, 2, 4, 5, 7],
    "workoutDuration": "30-45",
    "limitations": ["KNEE_PAIN", "NO_JUMPING"],
    "equipment": ["BODYWEIGHT", "YOGA_MAT"],
    "customWishes": "Mong muốn giảm mỡ bụng dưới"
  },
  "previousWeekSummary": {
    "completionRate": 80.0,
    "actualMinutes": 160,
    "targetMinutes": 200,
    "averageDifficulty": 3.8,
    "averageEnergy": 3.2,
    "painReports": ["KNEE_PAIN"],
    "focusDistribution": { "Core": 2, "Lower Body": 1, "Upper Body": 1 }
  },
  "targetWeek": {
    "startDate": "2026-10-05",
    "endDate": "2026-10-11"
  }
}
```
*(Nếu là tuần 1 sau Onboarding: `previousWeekSummary = null`).*

### Response Body: `WeeklyPlanDto` (Trạng thái Preview, `isActive = false`)
```json
{
  "id": "preview-plan-001",
  "userId": "kc-user-1",
  "goal": "Giảm mỡ bụng dưới & săn chắc cơ thể",
  "level": "BEGINNER",
  "durationPerSession": "30-45",
  "frequencyPerWeek": 5,
  "weeklyOverview": "Tuần thích ứng: 5 buổi · Tập trung Core & Thân trên · Tránh áp lực khớp gối",
  "coachTip": "Tuần trước bạn có mỏi gối, giáo án tuần này đã thay thế toàn bộ bài nhảy bằng bài tập tĩnh trên thảm.",
  "startDate": "2026-10-05",
  "endDate": "2026-10-11",
  "isActive": false,
  "days": [
    {
      "dayIndex": 1,
      "dayName": "T2",
      "date": "2026-10-05",
      "focus": "Core & Abs",
      "intensity": "Moderate",
      "totalMinutes": 35,
      "isRestDay": false,
      "exercises": [
        {
          "phase": "WARMUP",
          "name": "Khởi động xoay khớp cổ chân & hông",
          "durationMinutes": 5,
          "youtubeVideoId": "y87vQ6kG70k",
          "order": 1
        },
        {
          "phase": "MAIN",
          "name": "Plank & Gập bụng số 8 trên thảm",
          "durationMinutes": 22,
          "youtubeVideoId": "1f8yoFFdkLU",
          "order": 2
        },
        {
          "phase": "COOLDOWN",
          "name": "Giãn cơ bụng & hạ nhiệt",
          "durationMinutes": 8,
          "youtubeVideoId": "4vTj6pnd9v0",
          "order": 3
        }
      ]
    },
    {
      "dayIndex": 3,
      "dayName": "T4",
      "date": "2026-10-07",
      "focus": "Rest",
      "intensity": "Low",
      "totalMinutes": 0,
      "isRestDay": true,
      "exercises": []
    }
  ]
}
```

---

## 7. Kế Hoạch Kiểm Thử Tự Động (Automated Testing)

1. **`ExerciseCatalogTest`**:
   - Seed và tìm kiếm bài tập theo `code`.
   - Tìm kiếm video theo `exerciseId`, `level`, và `equipment`.
2. **`AiPlanValidatorTest`**:
   - Test 1: Hợp lệ 100% khi bài tập có trong catalog, khớp equipment, đúng scheduled/rest days.
   - Test 2: Từ chối bài tập có `code` không tồn tại trong Exercise Catalog.
   - Test 3: Từ chối khi bài tập đòi hỏi `DUMBBELL` trong khi user chỉ có `BODYWEIGHT`.
   - Test 4: Từ chối khi Rest Day có bài tập hoặc Scheduled Day bị rỗng.
3. **`GeminiPromptBuilderTest`**:
   - Case tuần đầu tiên (`previousWeekSummary = null`).
   - Case tuần thích ứng (`previousWeekSummary` chứa `painReports` và `difficulty` cao).
4. **`AiPlanGenerationIntegrationTest`**:
   - Kiểm tra toàn bộ luồng từ Input ➔ Gemini Raw ➔ Validator ➔ Catalog Mapping ➔ `WeeklyPlanDto`.
