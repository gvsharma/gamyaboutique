package com.gamyacouture.admin.api.dto;

import java.util.UUID;

public record TaxonomyOptionDto(
        UUID id,
        String name,
        String slug
) {
}
