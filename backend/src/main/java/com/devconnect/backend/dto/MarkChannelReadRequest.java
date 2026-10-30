package com.devconnect.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarkChannelReadRequest {
    @NotNull(message = "lastReadMessageId is required")
    private Long lastReadMessageId;
}

