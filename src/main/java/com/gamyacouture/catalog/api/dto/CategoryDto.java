package com.gamyacouture.catalog.api.dto;

import java.util.UUID;

public record CategoryDto(
        UUID id,
        String name,
        String slug,
        String description,
        int displayOrder,
        UUID parentId,
        String imageUrl
) {
}
