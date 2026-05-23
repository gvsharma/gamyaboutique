package com.gamyacouture.auth.api.dto;

public record TokenResponse(
        String accessToken,
        String tokenType,
        long expiresInMs
) {
}
