package com.devconnect.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TypingNotification {
    private Long channelId;
    private Long userId;
    private String username;
    private String fullName;
    private boolean typing;
}

