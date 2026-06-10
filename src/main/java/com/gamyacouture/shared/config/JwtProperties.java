package com.gamyacouture.shared.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.security.jwt")
public record JwtProperties(
        String secret,
        String issuer,
        long accessTokenExpirationMs,
        long refreshTokenExpirationMs,
        long rememberMeExpirationMs
) {
}
