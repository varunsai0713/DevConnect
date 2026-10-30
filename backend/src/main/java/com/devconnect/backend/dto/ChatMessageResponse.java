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
public class ChatMessageResponse {
    private Long id;
    private Long channelId;
    private Long senderId;
    private String senderUsername;
    private String senderFullName;
    private String senderAvatar;
    private String content;
    private String clientMessageId;
    private LocalDateTime createdAt;
}

