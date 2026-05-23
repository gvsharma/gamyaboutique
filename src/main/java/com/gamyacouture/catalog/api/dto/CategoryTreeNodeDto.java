package com.gamyacouture.catalog.api.dto;

import java.util.List;
import java.util.UUID;

public record CategoryTreeNodeDto(
        UUID id,
        String name,
        String slug,
        String description,
        int displayOrder,
        int depth,
        List<CategoryTreeNodeDto> children
) {
}
