package com.gamyacouture.site.api.dto;

import com.gamyacouture.site.domain.HomepageSlotKey;

import java.util.List;
import java.util.UUID;

public record HomepageSlotDto(
        HomepageSlotKey slotKey,
        String title,
        String subtitle,
        String body,
        String imageUrl,
        String collectionSlug,
        List<UUID> productIds,
        boolean active) {
}
