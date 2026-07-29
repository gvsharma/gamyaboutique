package com.gamyacouture.site.api.dto;

import java.time.Instant;
import java.util.UUID;

public record PromoVideoDto(
        UUID id,
        String title,
        String description,
        String videoUrl,
        String posterUrl,
        int displayOrder,
        boolean active,
        Instant updatedAt) {
}
