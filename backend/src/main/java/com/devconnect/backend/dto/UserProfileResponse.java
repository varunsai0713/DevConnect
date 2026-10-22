package com.devconnect.backend.dto;

import java.util.List;

public record UserProfileResponse(
        Long id,
        String username,
        String fullName,
        String email,
        String role,
        String experience,
        String location,
        String avatar,
        String bio,
        List<String> skills,
        String githubUrl,
        String linkedinUrl,
        String portfolioUrl) {
}
