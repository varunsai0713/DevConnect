package com.devconnect.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChannelReadResponse {
    private Long channelId;
    private Long userId;
    private Long lastReadMessageId;
    private long unreadCount;
}

