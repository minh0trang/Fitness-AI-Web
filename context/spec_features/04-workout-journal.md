# Feature Spec 04: F03 — WorkoutJournal

## 1. Mục Tiêu (Goal)

Xây dựng Domain và API quản lý **Nhật ký sau buổi tập (`WorkoutJournal`)** tại `activityservice`, lưu trữ kết quả tập luyện thực tế và phản hồi thể chất của người dùng từ modal sau tập luyện (`WorkoutJournalDialog.jsx`), làm nền tảng trực tiếp cho:
* Xác định trạng thái động `COMPLETED` của ngày tập trên Schedule.
* Render phổ màu đậm nhạt theo `energy` (1–5) trên lịch ProgressPage.
* Cung cấp dữ liệu để F04 tổng hợp thành `WeeklyHistorySummary` cho chu trình AI.

---

## 2. Bốn Điều Chỉnh Quan Trọng Đã Chốt

1. **`userId` = Keycloak ID**: Sử dụng nhất quán định danh Keycloak (OAuth2 `sub`) xuyên suốt microservices.
2. **Quy tắc Idempotency = `userId` + `planId` + `dayIndex`**: Khi người dùng submit lại nhật ký cho cùng một ngày của cùng một plan, hệ thống cập nhật bản ghi hiện tại thay vì sinh bản ghi trùng lặp.
3. **Compound Unique Index**: Đặt chỉ mục duy nhất trong MongoDB trên 3 trường:
   ```java
   @CompoundIndex(name = "user_plan_day_idx", def = "{'userId': 1, 'planId': 1, 'dayIndex': 1}", unique = true)
   ```
4. **Bảo Mật & Header `X-User-ID`**: Bỏ hoàn toàn endpoint `/user/{userId}`. Mọi thao tác truy vấn và lưu nhật ký bắt buộc trích xuất `userId` từ HTTP Header `X-User-ID` do API Gateway cung cấp.
5. **Cách Ly Event/RabbitMQ**: F03 thuần túy lưu trữ dữ liệu MongoDB ổn định, **không phát sinh event RabbitMQ** (sẽ xử lý độc lập tại F08).

---

## 3. Cấu Trúc Thực Thể (Entity Model)

Collection: **`workout_journals`** (MongoDB)

```json
{
  "_id": "ObjectId",
  "userId": "String (Keycloak ID)",
  "planId": "String (WeeklyPlan ObjectId)",
  "dayIndex": 1,
  "workoutTitle": "Core & Abs Blast",
  "workoutDate": "LocalDate (YYYY-MM-DD)",
  "completedAt": "LocalDateTime",
  
  "actualDurationMinutes": 42,
  "plannedDurationMinutes": 42,
  "plannedIntensity": "Moderate",
  "caloriesBurned": 210,
  
  "difficulty": 3,
  "energy": 4,
  "hasPain": false,
  "painLocations": [],
  "notes": "Hôm nay siết cơ bụng rất tốt, không bị đau thắt lưng.",
  "photoUrl": "https://storage.zerofitness.com/checkins/pic1.jpg",
  
  "createdAt": "LocalDateTime",
  "updatedAt": "LocalDateTime"
}
```

---

## 4. Quy Tắc Nghiệp Vụ & Validation (Business Rules)

* **Ràng buộc Plan**: `planId` bắt buộc phải tồn tại trong collection `weekly_plans`.
* **Ràng buộc Ngày**: `dayIndex` bắt buộc từ 1 đến 7.
* **Thang điểm RPE & Vitality**:
  * `difficulty`: Bắt buộc nguyên từ 1 đến 5 (1-Dễ thở -> 5-Kiệt sức).
  * `energy`: Bắt buộc nguyên từ 1 đến 5 (1-Kiệt sức -> 5-Bùng nổ).
* **Quy tắc Chấn thương**: Nếu `hasPain = false` hoặc `null` ➔ `painLocations` tự động làm rỗng (`[]`).
* **Lưu trữ Ảnh**: Chỉ chấp nhận URL tham chiếu tới Object Storage, từ chối dữ liệu ảnh thô Base64 (`data:image`).

---

## 5. Danh Sách API Endpoints

Base path: `/api/activities/journals` (hỗ trợ alias `/api/workout-journals`):

| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `POST` | `/api/activities/journals` | Lưu hoặc cập nhật nhật ký sau buổi tập (lấy `userId` từ `X-User-ID`). |
| `GET` | `/api/activities/journals/{journalId}` | Lấy chi tiết một journal theo ID (kiểm tra quyền sở hữu của `X-User-ID`). |
| `GET` | `/api/activities/journals/plan/{planId}` | Lấy toàn bộ danh sách các ngày đã hoàn thành của một kế hoạch tuần. |
| `GET` | `/api/activities/journals` | Lấy lịch sử tất cả các journal của user (trích xuất từ `X-User-ID`). |

---

## 6. Kết Quả Kiểm Thử Tự Động (Automated Testing)

* **`WorkoutJournalServiceTest`** (7 test cases - 100% Passed):
  * `testRecordJournal_Success`: Lưu thành công và trả về response.
  * `testRecordJournal_PlanNotFound`: Bắt ngoại lệ khi planId không tồn tại.
  * `testRecordJournal_InvalidDifficulty`: Bắt ngoại lệ khi difficulty ngoài 1–5.
  * `testRecordJournal_InvalidEnergy`: Bắt ngoại lệ khi energy ngoài 1–5.
  * `testRecordJournal_HasPainFalse_EmptiesPainLocations`: Tự làm rỗng vị trí đau khi hasPain = false.
  * `testRecordJournal_IdempotentUpdate`: Cập nhật bản ghi cũ khi trùng (userId, planId, dayIndex).
  * `testRecordJournal_RejectBase64Image`: Từ chối ảnh Base64 thô.
* **`WorkoutJournalControllerTest`** (4 test cases - 100% Passed):
  * POST lưu journal trả về `201 Created`.
  * POST lỗi validation trả về `400 Bad Request`.
  * GET journal theo ID trả về `200 OK`.
  * GET danh sách journal của user dựa vào header `X-User-ID`.
