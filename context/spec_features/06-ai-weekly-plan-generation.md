# Feature Spec 06: F05 — AI Weekly Plan Generation

## 1. Mục Tiêu (Goal)

Xây dựng chu trình sinh Kế hoạch tập tuần mới (**`WeeklyPlan`**) thích ứng bằng Google Gemini AI, kết hợp bộ kiểm tra nghiêm ngặt (**Validator Engine**) và kho danh mục bài tập/video chuẩn hóa (**Exercise & Video Catalog**) được đặt trực tiếp tại `activityservice`.

---

## 2. Kiến Trúc Luồng Thực Thi Chuẩn Hóa (Standardized Flow)

```text
         Profile + History (WeeklyHistorySummary)
                        │
                        ▼
                     [aiservice]
                  Google Gemini AI
                        │
                        ▼
                 Exercise Codes (Mã bài tập, sets, reps, duration, phase)
                        │
                        ▼
               [activityservice]
               Exercise Catalog (activityservice.exercises)
                        │ (Tra cứu thông tin bài tập theo code)
                        ▼
                Validator Engine
                        │ (Kiểm tra tồn tại, equipment, difficulty hierarchy, rest/scheduled days)
                        ▼
                 Video Catalog (activityservice.exercise_videos)
                        │ (Ghép video clip YouTube tương ứng)
                        ▼
               WeeklyPlan Preview (Xem trước trên /ai-plan)
                        │
                        ▼
                      Apply (User kích hoạt thành ACTIVE)
```

---

## 3. Hai (2) Model Mới Tại `activityservice` (Không Cần Video Service Riêng)

Cả hai model được đặt trực tiếp trong `activityservice` để truy vấn nội bộ tốc độ cao, không cần thêm microservice quản lý video riêng.

### 3.1. Entity `Exercise` (Collection: `exercises`)
Lưu danh mục các bài tập chuẩn hóa làm từ điển đối chiếu:

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
  "exerciseCode": "String (PUSH_UP)",
  "title": "Hướng dẫn hít đất chuẩn form cho người mới",
  "youtubeUrl": "https://www.youtube.com/watch?v=IODxDxX7oi4",
  "youtubeVideoId": "IODxDxX7oi4",
  "thumbnailUrl": "https://img.youtube.com/vi/IODxDxX7oi4/hqdefault.jpg",
  "duration": 300,
  "level": "BEGINNER",
  "equipment": ["BODYWEIGHT"]
}
```
* `id` (`String` / ObjectId): Khóa chính.
* `exerciseId` (`String`): Khóa ngoại liên kết tới `exercises`.
* `exerciseCode` (`String`): Mã bài tập đối ứng.
* `title` (`String`): Tiêu đề video.
* `youtubeUrl` & `youtubeVideoId`: Đường dẫn video YouTube thực tế và ID phát video nhúng.
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
   - Backend lấy mã `code` tra cứu trong `Exercise Catalog` ➔ Lấy `exerciseId`.
   - Tìm kiếm trong `ExerciseVideo` các clip có `exerciseId` khớp, ưu tiên video có `level` và `equipment` tương thích với `UserProfile` của người dùng.

---

## 5. Quy Tắc Kiểm Tra Của Validator (Validator Rules)

Sau khi Gemini trả về mã bài tập và hệ thống tra cứu qua **Exercise Catalog**, `AiPlanValidator` kiểm tra nghiêm ngặt 5 tiêu chí:

### 5.1. Exercise có tồn tại trong Catalog không?
* Mọi mã `code` do Gemini sinh ra bắt buộc phải tìm thấy thực thể tương ứng trong collection `exercises`.
* Nếu mã lạ không tồn tại ➔ Validator từ chối plan hoặc fallback bài tập cùng nhóm cơ.

### 5.2. Equipment có phù hợp không?
* Mọi dụng cụ yêu cầu của bài tập (`exercise.equipment`) phải nằm trong tập dụng cụ người dùng sở hữu (`userProfile.equipment`).
* Ví dụ: Nếu user chỉ chọn `BODYWEIGHT`, bài tập yêu cầu `DUMBBELL` hoặc `KETTLEBELL` sẽ bị Validator từ chối.

### 5.3. Định nghĩa cấp bậc Difficulty Hierarchy (Không để Validator tự đoán)
Validator áp dụng quy tắc phân cấp rõ ràng theo kinh nghiệm tập luyện của người dùng:

| Trình độ User (`userProfile.experience`) | Tập độ khó bài tập được phép (`exercise.difficulty`) |
| :--- | :--- |
| **`BEGINNER`** | Chỉ chấp nhận bài tập **`BEGINNER`**. |
| **`INTERMEDIATE`** | Chấp nhận bài tập **`BEGINNER`** và **`INTERMEDIATE`**. |
| **`ADVANCED`** | Chấp nhận toàn bộ: **`BEGINNER`**, **`INTERMEDIATE`**, và **`ADVANCED`**. |

*Nếu bài tập vượt quá cấp bậc cho phép của user ➔ Validator đánh dấu vi phạm.*

### 5.4. Scheduled Day có bài tập không?
* Các ngày thuộc `userProfile.selectedDays` bắt buộc có `isRestDay = false` và phải có đủ 3 pha: `WARMUP`, `MAIN`, `COOLDOWN`.

### 5.5. Rest Day không có bài tập không?
* Các ngày KHÔNG thuộc `selectedDays` bắt buộc có `isRestDay = true` và danh sách bài tập rỗng (`exercises = []`).

---

## 6. Phản Hồi Thể Chất: Sử Dụng Thuật Ngữ `painReports` (Tránh Kết Luận Y Khoa)

Hệ thống **không đưa ra kết luận hoặc chẩn đoán y khoa**. Hệ thống chỉ tiếp nhận và thích ứng theo phản hồi thể chất chủ quan của người dùng:
* Thay vì gọi "chấn thương", hệ thống định danh là **`painReports` / tín hiệu mệt mỏi**.
* **Tuần đầu tiên (First Plan)**: `previousWeekSummary = null` ➔ Gemini sinh giáo án khởi động dựa trên `UserProfile` (mục tiêu, sở thích, hạn chế vận động).
* **Tuần thích ứng (Adaptive Plan)**: Nhận `previousWeekSummary` chứa `painReports` (ví dụ `["KNEE_PAIN"]`) và tín hiệu mệt mỏi (`averageDifficulty` cao, `averageEnergy` thấp):
  - Gemini tự động né các động tác tác động vào khu vực người dùng báo đau (ví dụ gối đau ➔ thay thế bài nhảy/squat sâu bằng bài tĩnh trên thảm).
  - Tự động điều chỉnh cường độ (deload) nếu ghi nhận mệt mỏi kéo dài.

---

## 7. Cấu Trúc Request & Response

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
  "weeklyOverview": "Tuần thích ứng: 5 buổi · Tập trung Core & Thân trên · Tránh áp lực khu vực báo đau gối",
  "coachTip": "Tuần trước bạn có báo mỏi gối (painReports), giáo án tuần này đã thay thế toàn bộ bài nhảy bằng bài tập tĩnh trên thảm.",
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

## 8. Kế Hoạch Kiểm Thử Tự Động (Automated Testing)

1. **`ExerciseCatalogTest`**:
   - Seed và tìm kiếm bài tập theo `code`.
   - Tìm kiếm video theo `exerciseId`, `level`, và `equipment`.
2. **`AiPlanValidatorTest`**:
   - Test 1: Hợp lệ 100% khi bài tập có trong catalog, khớp equipment, đúng Difficulty Hierarchy, đúng scheduled/rest days.
   - Test 2: Từ chối khi bài tập có `code` không tồn tại trong Exercise Catalog.
   - Test 3: Từ chối khi bài tập đòi hỏi `DUMBBELL` trong khi user chỉ có `BODYWEIGHT`.
   - Test 4: Từ chối khi user `BEGINNER` bị giao bài `ADVANCED`.
   - Test 5: Từ chối khi Rest Day có bài tập hoặc Scheduled Day bị rỗng.
3. **`GeminiPromptBuilderTest`**:
   - Case tuần đầu tiên (`previousWeekSummary = null`).
   - Case tuần thích ứng (`previousWeekSummary` chứa `painReports` và tín hiệu mệt mỏi).
4. **`AiPlanGenerationIntegrationTest`**:
   - Kiểm tra toàn bộ luồng từ Input ➔ Gemini Raw ➔ Exercise Catalog ➔ Validator ➔ Video Catalog ➔ `WeeklyPlanDto`.
