package com.gamyacouture.shared.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.mail")
public record MailProperties(
        boolean enabled,
        String from,
        String frontendUrl
) {
    public MailProperties {
        if (from == null || from.isBlank()) {
            from = "noreply@gamyacouture.com";
        }
        if (frontendUrl == null || frontendUrl.isBlank()) {
            frontendUrl = "http://localhost:3000";
        }
    }
}
