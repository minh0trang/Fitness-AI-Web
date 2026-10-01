# Feature Spec 05: F04 — WeeklyHistorySummary

## 1. Mục Tiêu (Goal)

Xây dựng Domain và API tổng hợp **Tóm tắt Lịch sử Tuần (`WeeklyHistorySummary`)** tại `activityservice`, tổng hợp dữ liệu từ `WeeklyPlan` và các bản ghi `WorkoutJournal` của tuần trước thành một đối tượng ngữ cảnh thể chất nhỏ gọn (compact physical context).

DTO này được sử dụng trực tiếp làm đầu vào `previousWeekSummary` cho `aiservice` (ở F05) để Gemini AI thích ứng giáo án tuần mới dựa trên:
* Mức độ kỷ luật bám sát lịch tập (`completionRate`, `completedDays`).
* Khối lượng vận động thực tế (`actualMinutes` vs `targetMinutes`).
* Phản hồi thể chất & độ mệt mỏi trung bình (`averageDifficulty` RPE 1–5, `averageEnergy` 1–5).
* Vị trí đau/chấn thương cần tránh bài tập (`painReports`).
* Nhóm cơ thực tế đã kích hoạt tuần qua (`focusDistribution`).

> **Nguyên tắc thiết kế cốt lõi**: Không gửi toàn bộ raw workout history / journal logs sang Gemini AI nhằm tối ưu token, giảm độ trễ và chống loãng context của LLM.

---

## 2. Tám (8) Quy Tắc Nghiệp Vụ Cốt Lõi Đã Chốt

### 2.1. Xác định "Tuần Trước" (Previous Week Plan)
* Khi phục vụ luồng AI sinh plan mới hoặc Weekly Review: Hệ thống **bắt buộc lấy Plan của tuần vừa kết thúc**.
* Nếu user mới toanh (First week, chưa có lịch sử tuần trước): Trả về `previousWeekSummary = null`. AI sẽ tạo giáo án tuần 1 hoàn toàn dựa trên `UserProfile`.

### 2.2. Điều kiện xác định "Tuần đã kết thúc"
* Dựa trên mốc thời gian lịch: **`plan.weekEndDate < LocalDate.now()`**.
* Hệ thống không dựa vào `status` tĩnh trong database, đảm bảo tính toán động và không phụ thuộc vào cron job nửa đêm.

### 2.3. Ý nghĩa của `completedDays`
* Một `WorkoutJournal` tồn tại cho một ngày có lịch tập (`isRestDay == false`) đồng nghĩa ngày đó **chắc chắn đã hoàn thành**.
* Phản ánh trung thực người dùng đã check-in tập luyện.

### 2.4. Xử lý Journal của ngày nghỉ (Rest Day)
* **KHÔNG tính vào `completedDays`** và **KHÔNG làm tăng `completionRate`** (tránh tình trạng tỷ lệ hoàn thành vượt quá 100% hoặc khuyến khích phá vỡ kỷ luật nghỉ ngơi).
* **VẪN ĐƯỢC CỘNG VÀO**: `actualMinutes`, và được tính vào các chỉ số thể chất (chi tiết ở mục 2.8).

### 2.5. Cách tính `targetMinutes`
* Chỉ cộng dồn `totalMinutes` của các ngày scheduled (`isRestDay == false`).
* Bỏ qua hoàn toàn ngày Rest Day (`isRestDay == true`, target = 0 phút).

### 2.6. `focusDistribution` phản ánh Kế hoạch hay Thực tế?
* **Chỉ đếm theo THỰC TẾ các buổi đã hoàn thành (có WorkoutJournal)**.
* *Ví dụ*: Plan đề ra `Core × 2, Upper Body × 1`, nhưng user chỉ hoàn thành 1 buổi Core ➔ `focusDistribution = {"Core": 1}`.
* Nhờ đó, AI biết nhóm cơ nào bị bỏ lỡ để bù đắp vào tuần kế tiếp.

### 2.7. Xử lý phòng vệ khi `dayIndex` của Journal không khớp Plan
* Không ném ngoại lệ làm sập API (Defensive Fallback).
* Vẫn tính các chỉ số thời gian và thể chất của Journal.
* Với `focusDistribution`: Fallback lấy tên từ `journal.workoutTitle` hoặc gán nhãn `"Other"`, đồng thời ghi `log.warn`.

### 2.8. Phạm vi tính toán giữa Kỷ luật Kế hoạch vs Sức tải Thể chất
| Nhóm Chỉ Số | Các Trường Dữ Liệu | Phạm Vi Dữ Liệu Được Tính |
| :--- | :--- | :--- |
| **Kỷ luật Kế hoạch** | `totalScheduledDays`, `completedDays`, `completionRate`, `targetMinutes` | **Chỉ tính trên Scheduled Days** (`isRestDay == false`). |
| **Sức tải & Phản hồi Thể chất** | `actualMinutes`, `averageDifficulty`, `averageEnergy`, `painReports` | **Tính trên TOÀN BỘ Journal ghi nhận được trong tuần** (kể cả Rest Day nếu user có vận động). |

---

## 3. Cấu Trúc DTO (Data Transfer Object)

### `WeeklyHistorySummaryDto`
```json
{
  "planId": "65f1a2b3c4d5e6f7a8b9c0d1",
  "weekStartDate": "2026-09-28",
  "weekEndDate": "2026-10-04",
  "totalScheduledDays": 5,
  "completedDays": 4,
  "completionRate": 80.0,
  "actualMinutes": 168,
  "targetMinutes": 190,
  "averageDifficulty": 3.2,
  "averageEnergy": 3.8,
  "painReports": [
    "KNEE_PAIN",
    "LOWER_BACK"
  ],
  "focusDistribution": {
    "Core": 2,
    "Lower Body": 1,
    "Upper Body": 1
  }
}
```

---

## 4. Công Thức Tính Toán Chi Tiết (Aggregation Formulas)

1. **`totalScheduledDays`**:
   $$\text{totalScheduledDays} = \sum_{\text{day} \in \text{plan.days}} [!\text{day.isRestDay}]$$

2. **`completedDays`**:
   Số lượng bản ghi `WorkoutJournal` có `dayIndex` ứng với ngày có `isRestDay == false` trong `WeeklyPlan`.

3. **`completionRate`**:
   $$\text{completionRate} = \begin{cases} 0.0 & \text{nếu } \text{totalScheduledDays} = 0 \\ \text{round}\left(\frac{\text{completedDays} \times 100.0}{\text{totalScheduledDays}}, 1\right) & \text{ngược lại} \end{cases}$$

4. **`actualMinutes`**:
   Tổng `actualDurationMinutes` của tất cả `WorkoutJournal` thuộc tuần (kể cả Rest Day).

5. **`targetMinutes`**:
   $$\text{targetMinutes} = \sum_{\text{day} \in \text{plan.days}, \ !day.isRestDay} \text{day.totalMinutes}$$

6. **`averageDifficulty`**:
   Trung bình cộng `difficulty` (1–5) của tất cả Journals ghi nhận được. Làm tròn 1 chữ số thập phân. Nếu 0 journal ➔ `0.0`.

7. **`averageEnergy`**:
   Trung bình cộng `energy` (1–5) của tất cả Journals ghi nhận được. Làm tròn 1 chữ số thập phân. Nếu 0 journal ➔ `0.0`.

8. **`painReports`**:
   Danh sách không trùng lặp (distinct) gom toàn bộ `painLocations` từ các Journal có `hasPain == true`.

9. **`focusDistribution`**:
   Map thống kê tần suất nhóm cơ `focus` thực tế hoàn thành (`Map<String, Integer>`). Khớp `dayIndex` của Journal với `focus` của `WorkoutDay` tương ứng trong plan.

---

## 5. Danh Sách API Endpoints

Base path: `/api/activities/summary/weekly` (thuộc `activityservice`):

| Method | Endpoint | Query Params | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/activities/summary/weekly` | `scope=previous` *(default)* | Lấy tóm tắt tuần vừa kết thúc của user (dùng cho AI sinh plan tuần mới). Trả về `200 OK` với body `null` hoặc `204 No Content` nếu là tuần đầu tiên. |
| `GET` | `/api/activities/summary/weekly` | `scope=current` | Lấy tóm tắt tiến độ tuần đang diễn ra của user (dùng cho Dashboard / Progress giữa tuần). |
| `GET` | `/api/activities/summary/weekly/{planId}` | Không | Lấy tóm tắt chi tiết của một `WeeklyPlan` xác định theo `planId`. |

> **Bảo Mật**: Bỏ hoàn toàn endpoint `/user/{userId}`. Mọi request bắt buộc gửi kèm header **`X-User-ID`** (Keycloak ID). Endpoint sẽ kiểm tra quyền sở hữu plan trước khi tính toán.

---

## 6. Kế Hoạch Kiểm Thử Tự Động (Automated Test Plan)

### 6.1. Unit Test: `WeeklyHistorySummaryServiceTest`
1. **Case 1: User mới (No History)**:
   - Không có plan cũ trước ngày hôm nay ➔ Trả về `Optional.empty()` / `null`.
2. **Case 2: Tuần hoàn chỉnh (5 scheduled, 4 completed)**:
   - Plan có 5 ngày tập (mỗi ngày 40p = target 200p), 2 ngày nghỉ.
   - User hoàn thành 4 journal (tổng 160p).
   - Verify: `totalScheduledDays = 5`, `completedDays = 4`, `completionRate = 80.0%`, `targetMinutes = 200`, `actualMinutes = 160`.
3. **Case 3: Tập vào Rest Day**:
   - User tập thêm 1 buổi 30p vào Chủ Nhật (Rest Day).
   - Verify: `completedDays` vẫn là 4 (không tăng lên 5), `completionRate` vẫn 80.0%, nhưng `actualMinutes` tăng lên 190.
4. **Case 4: Báo cáo chấn thương (Pain Reports)**:
   - Ngày 1 báo đau `["KNEE_PAIN"]`, ngày 3 báo đau `["KNEE_PAIN", "LOWER_BACK"]`.
   - Verify: `painReports` gom distinct thành `["KNEE_PAIN", "LOWER_BACK"]`.
5. **Case 5: Phân bổ nhóm cơ thực tế (`focusDistribution`)**:
   - Plan có Core × 2, Legs × 1, Upper × 1. User chỉ tập 1 Core và 1 Legs.
   - Verify: `focusDistribution = {"Core": 1, "Legs": 1}`.
6. **Case 6: Điểm đánh giá trung bình (`averageDifficulty`, `averageEnergy`)**:
   - Journals có RPE [3, 4, 3] và Energy [4, 3, 5].
   - Verify: `averageDifficulty = 3.3`, `averageEnergy = 4.0`.

### 6.2. Controller Slice Test: `WeeklyHistorySummaryControllerTest`
1. `GET /api/activities/summary/weekly` trả về `200 OK` với JSON summary hợp lệ khi có `X-User-ID`.
2. `GET /api/activities/summary/weekly` trả về `204 No Content` khi không có lịch sử tuần trước.
3. `GET /api/activities/summary/weekly/{planId}` trả về `403 Forbidden` hoặc `400 Bad Request` khi user truy cập plan của người khác.
