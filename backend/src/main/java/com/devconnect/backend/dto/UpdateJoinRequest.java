package com.devconnect.backend.dto;

import com.devconnect.backend.model.JoinRequestStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateJoinRequest {
    @NotNull(message = "Status is required (ACCEPTED or DECLINED)")
    private JoinRequestStatus status;
}

