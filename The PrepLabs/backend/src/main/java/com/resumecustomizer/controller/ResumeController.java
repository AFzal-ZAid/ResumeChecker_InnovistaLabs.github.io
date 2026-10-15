package com.resumecustomizer.controller;

import com.resumecustomizer.exception.ApiException;
import com.resumecustomizer.model.CustomizedResume;
import com.resumecustomizer.service.GeminiService;
import com.resumecustomizer.service.ResumeParserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class ResumeController {

    private static final int MIN_JD_LENGTH = 100;
    private static final int MAX_JD_LENGTH = 10000;

    private final ResumeParserService parserService;
    private final GeminiService geminiService;

    public ResumeController(ResumeParserService parserService, GeminiService geminiService) {
        this.parserService = parserService;
        this.geminiService = geminiService;
    }

    @PostMapping(value = "/customize", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public CustomizedResume customize(@RequestParam("jobDescription") String jobDescription,
                                      @RequestParam("resume") MultipartFile resume) {
        String jd = jobDescription.trim();

        if (jd.length() < MIN_JD_LENGTH) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "The job description must be at least " + MIN_JD_LENGTH + " characters long.");
        }
        if (jd.length() > MAX_JD_LENGTH) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "The job description must be under " + MAX_JD_LENGTH + " characters.");
        }

        String resumeText = parserService.extractText(resume);
        return geminiService.customize(jd, resumeText);
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok");
    }
}
