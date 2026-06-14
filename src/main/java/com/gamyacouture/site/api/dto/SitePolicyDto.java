package com.gamyacouture.site.api.dto;

import java.time.Instant;

public record SitePolicyDto(
        String key,
        String title,
        String content,
        Instant updatedAt
) {
}
