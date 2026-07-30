package com.gamyacouture.catalog.api.dto;

import com.gamyacouture.catalog.domain.CollectionType;

import java.time.LocalDate;
import java.util.UUID;

public record CollectionDto(
        UUID id,
        String name,
        String slug,
        CollectionType collectionType,
        String description,
        LocalDate startsAt,
        LocalDate endsAt,
        String imageUrl,
        int displayOrder
) {
}
