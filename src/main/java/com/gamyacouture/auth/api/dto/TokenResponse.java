package com.gamyacouture.auth.api.dto;

public record TokenResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        long expiresInMs,
        long refreshExpiresInMs
) {
}
