package com.gamyacouture.admin.api.dto;

import java.util.UUID;

public record AdminFabricDto(
        UUID id,
        String name,
        String slug,
        String description,
        String composition,
        boolean active
) {
}
