package com.fitness.activityservice.ai;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class GoogleGeminiClientTest {

    @Test
    @DisplayName("sanitizeJsonResponse - Loại bỏ chính xác các thẻ ```json và ``` từ phản hồi markdown")
    void testSanitizeJsonResponse_MarkdownCodeBlocks() {
        String inputWithJsonFence = "```json\n{\"goal\":\"FAT_LOSS\",\"days\":[]}\n```";
        String cleaned = GoogleGeminiClient.sanitizeJsonResponse(inputWithJsonFence);
        assertThat(cleaned).isEqualTo("{\"goal\":\"FAT_LOSS\",\"days\":[]}");

        String inputWithPlainFence = "```\n{\"goal\":\"STRENGTH\"}\n```";
        String cleanedPlain = GoogleGeminiClient.sanitizeJsonResponse(inputWithPlainFence);
        assertThat(cleanedPlain).isEqualTo("{\"goal\":\"STRENGTH\"}");

        String inputAlreadyPureJson = "{\"goal\":\"CARDIO\"}";
        String cleanedPure = GoogleGeminiClient.sanitizeJsonResponse(inputAlreadyPureJson);
        assertThat(cleanedPure).isEqualTo("{\"goal\":\"CARDIO\"}");
    }

    @Test
    @DisplayName("sanitizeJsonResponse - Xử lý chuỗi rỗng và khoảng trắng an toàn")
    void testSanitizeJsonResponse_NullAndEmpty() {
        assertThat(GoogleGeminiClient.sanitizeJsonResponse(null)).isEmpty();
        assertThat(GoogleGeminiClient.sanitizeJsonResponse("   ")).isEmpty();
    }
}
