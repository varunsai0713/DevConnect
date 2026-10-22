package com.devconnect.backend.dto;

import java.util.List;
import lombok.Data;

@Data
public class UserProfileRequest {
    private String fullName;
    private String role;
    private String experience;
    private String location;
    private String avatar;
    private String bio;
    private List<String> skills;
    private String githubUrl;
    private String linkedinUrl;
    private String portfolioUrl;
}
