package com.gamyacouture.site.api.dto;

import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

public record UpsertHomepageSlotRequest(
        @Size(max = 200) String title,
        @Size(max = 500) String subtitle,
        String body,
        @Size(max = 500) String imageUrl,
        @Size(max = 120) String collectionSlug,
        List<UUID> productIds,
        Boolean active) {
}
