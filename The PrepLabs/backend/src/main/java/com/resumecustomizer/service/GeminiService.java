package com.resumecustomizer.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumecustomizer.exception.ApiException;
import com.resumecustomizer.model.CustomizedResume;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.Map;
import java.util.Set;

@Service
public class GeminiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);
    private static final int MAX_ATTEMPTS = 3;
    private static final Set<Integer> RETRYABLE_STATUSES = Set.of(429, 500, 503);

    private final RestClient client;
    private final ObjectMapper mapper;
    private final String apiKey;
    private final String model;

    public GeminiService(RestClient.Builder builder,
                         ObjectMapper mapper,
                         @Value("${gemini.api-key}") String apiKey,
                         @Value("${gemini.model}") String model,
                         @Value("${gemini.base-url}") String baseUrl) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10_000);
        factory.setReadTimeout(90_000);
        this.client = builder.baseUrl(baseUrl).requestFactory(factory).build();
        this.mapper = mapper;
        this.apiKey = apiKey;
        this.model = model;
    }

    public CustomizedResume customize(String jobDescription, String resumeText) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "The Gemini API key is not configured on the server.");
        }
        JsonNode response = send(PromptFactory.requestBody(jobDescription, resumeText));
        return parse(response);
    }

    private JsonNode send(Map<String, Object> body) {
        for (int attempt = 1; ; attempt++) {
            try {
                return client.post()
                        .uri("/models/{model}:generateContent", model)
                        .header("x-goog-api-key", apiKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(body)
                        .retrieve()
                        .body(JsonNode.class);
            } catch (RestClientResponseException e) {
                int status = e.getStatusCode().value();
                log.warn("Gemini returned {} on attempt {}", status, attempt);
                if (RETRYABLE_STATUSES.contains(status) && attempt < MAX_ATTEMPTS) {
                    pause(attempt * 1500L);
                    continue;
                }
                throw translate(status);
            } catch (ResourceAccessException e) {
                log.warn("Gemini call failed on attempt {}: {}", attempt, e.getMessage());
                if (attempt < MAX_ATTEMPTS) {
                    pause(attempt * 1500L);
                    continue;
                }
                throw new ApiException(HttpStatus.GATEWAY_TIMEOUT, "Gemini took too long to respond. Please try again.");
            }
        }
    }

    private ApiException translate(int status) {
        return switch (status) {
            case 400, 403 -> new ApiException(HttpStatus.BAD_GATEWAY,
                    "Gemini rejected the request. Check the API key and model name on the server.");
            case 429 -> new ApiException(HttpStatus.TOO_MANY_REQUESTS,
                    "The Gemini rate limit was reached. Wait a moment and try again.");
            default -> new ApiException(HttpStatus.BAD_GATEWAY,
                    "Gemini is temporarily unavailable. Please try again shortly.");
        };
    }

    private CustomizedResume parse(JsonNode response) {
        String text = response.path("candidates").path(0).path("content").path("parts").path(0).path("text")
                .asText("").trim();
        if (text.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Gemini returned an empty response. Please try again.");
        }
        String json = text.replaceAll("^```(?:json)?\\s*|\\s*```$", "");
        try {
            return mapper.readValue(json, CustomizedResume.class);
        } catch (JsonProcessingException e) {
            log.error("Could not parse Gemini output", e);
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Gemini returned an unreadable response. Please try again.");
        }
    }

    private void pause(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "The request was interrupted.");
        }
    }
}
