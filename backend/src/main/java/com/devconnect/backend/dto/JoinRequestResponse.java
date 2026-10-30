package com.devconnect.backend.dto;

import com.devconnect.backend.model.JoinRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JoinRequestResponse {
    private Long id;
    private Long workspaceId;
    private String workspaceName;
    private Long userId;
    private String username;
    private String fullName;
    private String avatar;
    private JoinRequestStatus status;
    private LocalDateTime createdAt;
}

