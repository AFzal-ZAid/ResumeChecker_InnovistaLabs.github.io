package com.resumecustomizer.model;

import java.util.List;

public record CustomizedResume(
        String name,
        List<String> contact,
        String summary,
        List<String> skills,
        List<String> highlightedSkills,
        List<Experience> experience,
        List<Project> projects,
        List<Education> education,
        List<String> missingKeywords,
        List<String> improvements,
        int originalMatchScore,
        int customizedMatchScore,
        int atsScore) {

    public record Experience(String title, String company, String duration, List<String> bullets) {
    }

    public record Project(String name, String tech, List<String> bullets) {
    }

    public record Education(String degree, String institution, String duration) {
    }
}
