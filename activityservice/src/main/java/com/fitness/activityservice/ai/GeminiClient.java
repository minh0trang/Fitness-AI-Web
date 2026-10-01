package com.fitness.activityservice.ai;

/**
 * Interface giao tiếp với Gemini LLM.
 *
 * NGUYÊN TẮC QUAN TRỌNG:
 * GeminiClient CHỈ có nhiệm vụ gửi prompt và lấy raw response.
 * Tuyệt đối KHÔNG tự validate business logic tại đây.
 * AiPlanValidator là Single Source of Truth cho toàn bộ business rules.
 */
public interface GeminiClient {

    /**
     * Gửi prompt tới Gemini API và nhận Raw JSON string.
     *
     * @param prompt Nội dung prompt chuẩn hóa
     * @return Chuỗi Raw JSON thuần túy do Gemini sinh ra
     * @throws GeminiApiException Nếu xảy ra lỗi kết nối, timeout hoặc phản hồi không hợp lệ từ API
     */
    String generateRawPlan(String prompt);
}
