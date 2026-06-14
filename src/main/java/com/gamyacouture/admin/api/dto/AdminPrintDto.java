package com.gamyacouture.admin.api.dto;

import java.util.UUID;

public record AdminPrintDto(
        UUID id,
        String name,
        String slug,
        String description,
        String patternType,
        boolean active
) {
}
