package com.devconnect.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateChannelRequest {

    @NotBlank(message = "Channel name is required")
    @Size(min = 2, max = 30, message = "Channel name must be between 2 and 30 characters")
    @Pattern(
        regexp = "^[a-z0-9-]+$",
        message = "Channel name must contain only lowercase letters, numbers, and hyphens"
    )
    private String name;
}

