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
public class WorkspaceResponse {
    private Long id;
    private Long projectId;
    private String name;
    private String createdBy;
    private LocalDateTime createdAt;
    private WorkspaceRole userRole;
    private long totalUnread;
    private long membersCount;
    private long channelsCount;
}

