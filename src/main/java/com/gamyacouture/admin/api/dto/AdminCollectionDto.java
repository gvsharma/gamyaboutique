package com.gamyacouture.admin.api.dto;

import com.gamyacouture.catalog.domain.CollectionType;

import java.time.LocalDate;
import java.util.UUID;

public record AdminCollectionDto(
        UUID id,
        String name,
        String slug,
        CollectionType collectionType,
        String season,
        int year,
        String description,
        LocalDate startsAt,
        LocalDate endsAt,
        String imageUrl,
        int displayOrder,
        boolean active
) {
}
