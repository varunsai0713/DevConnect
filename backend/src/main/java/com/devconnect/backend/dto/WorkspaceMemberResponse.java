package com.devconnect.backend.dto;

import com.devconnect.backend.model.WorkspaceRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkspaceMemberResponse {
    private Long userId;
    private String username;
    private String fullName;
    private String avatar;
    private WorkspaceRole role;
    private LocalDateTime joinedAt;
}

