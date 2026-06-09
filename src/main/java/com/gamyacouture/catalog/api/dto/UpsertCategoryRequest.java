package com.gamyacouture.catalog.api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record UpsertCategoryRequest(
        @NotBlank @Size(max = 200) String name,
        @Size(max = 200) String slug,
        String description,
        UUID parentId,
        @Min(0) Integer displayOrder,
        Boolean active
) {
}
