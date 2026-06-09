package com.gamyacouture.shared.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.storage.s3")
public record S3StorageProperties(
        boolean enabled,
        String bucket,
        String region,
        String publicBaseUrl,
        String keyPrefix
) {
}
