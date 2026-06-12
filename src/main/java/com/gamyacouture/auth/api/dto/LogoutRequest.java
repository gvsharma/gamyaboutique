package com.gamyacouture.auth.api.dto;

import jakarta.validation.constraints.NotBlank;

public record LogoutRequest(
        String refreshToken
) {
}
