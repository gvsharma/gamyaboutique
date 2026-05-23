package com.gamyacouture.product.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProductSearchRequest(
        @Schema(description = "Search query", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank
        @Size(min = 1, max = 200)
        String q
) {
}
