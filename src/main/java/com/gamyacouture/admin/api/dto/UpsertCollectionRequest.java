package com.gamyacouture.admin.api.dto;

import com.gamyacouture.catalog.domain.CollectionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record UpsertCollectionRequest(
        @NotBlank @Size(max = 200) String name,
        @Size(max = 200) String slug,
        @NotNull CollectionType collectionType,
        @Size(max = 30) String season,
        Integer year,
        String description,
        LocalDate startsAt,
        LocalDate endsAt,
        @Size(max = 500) String imageUrl,
        Integer displayOrder,
        Boolean active
) {
}
