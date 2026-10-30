package com.devconnect.backend.dto;

import com.devconnect.backend.model.WorkspaceRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkspaceDetailResponse {
    private Long id;
    private Long projectId;
    private String name;
    private String createdBy;
    private LocalDateTime createdAt;
    private WorkspaceRole userRole;
    private List<ChannelResponse> channels;
    private long membersCount;
}

