package com.fitness.aiservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;


@Service
public class GeminiService {

    @Value("${gemini.api.url}")
    private String geminiUrl;

    @Value("${gemini.api.key}")
    private String geminiApiKey;


    private final WebClient webClient;

    public GeminiService(WebClient.Builder webClient) {
        this.webClient = webClient.build();
    }

    public String getAnswer(String question) {
        Map<String, Object> requestBody
                = Map.of("contents", new Object[]{
                        Map.of("parts", new Object[]{
                          Map.of("text", question)
                        }),
        });
        String response =webClient.post()
                .uri(geminiUrl+geminiApiKey)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();
        return response;
    }
}
