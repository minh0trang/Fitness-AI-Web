package com.fitness.activityservice.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Component
@Slf4j
public class GoogleGeminiClient implements GeminiClient {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=}")
    private String geminiUrl;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${gemini.timeout-seconds:15}")
    private int timeoutSeconds;

    public GoogleGeminiClient(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    @Override
    public String generateRawPlan(String prompt) {
        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            log.warn("Gemini API key is not configured (gemini.api.key is blank)");
        }

        String targetUrl = buildTargetUrl();

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt)
                        ))
                )
        );

        try {
            log.debug("Sending prompt to Gemini API at endpoint: {}", geminiUrl);

            String responseBody = webClient.post()
                    .uri(targetUrl)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(timeoutSeconds))
                    .block();

            if (responseBody == null || responseBody.isBlank()) {
                throw new GeminiApiException("Received empty response from Gemini API");
            }

            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode textNode = root.at("/candidates/0/content/parts/0/text");

            if (textNode.isMissingNode() || textNode.asText().isBlank()) {
                throw new GeminiApiException("No content text found in Gemini response: " + responseBody);
            }

            String rawText = textNode.asText();
            return sanitizeJsonResponse(rawText);

        } catch (GeminiApiException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to communicate with Gemini API: {}", e.getMessage(), e);
            throw new GeminiApiException("Error calling Gemini API: " + e.getMessage(), e);
        }
    }

    private String buildTargetUrl() {
        if (geminiUrl == null || geminiUrl.isBlank()) {
            return "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey;
        }
        if (geminiUrl.endsWith("key=")) {
            return geminiUrl + (geminiApiKey != null ? geminiApiKey : "");
        }
        if (!geminiUrl.contains("key=")) {
            String separator = geminiUrl.contains("?") ? "&" : "?";
            return geminiUrl + separator + "key=" + (geminiApiKey != null ? geminiApiKey : "");
        }
        return geminiUrl;
    }

    /**
     * Loại bỏ markdown backticks (```json ... ```) nếu Gemini vô tình sinh kèm.
     */
    public static String sanitizeJsonResponse(String raw) {
        if (raw == null) return "";
        String cleaned = raw.trim();

        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }

        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }

        return cleaned.trim();
    }
}
