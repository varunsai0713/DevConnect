package com.devconnect.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminWorkspaceResponse {
    private Long id;
    private Long projectId;
    private String projectTitle;
    private String name;
    private String createdByUsername;
    private String createdByEmail;
    private LocalDateTime createdAt;
    private long membersCount;
    private long channelsCount;
}

