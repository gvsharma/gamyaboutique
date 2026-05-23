package com.gamyacouture.product.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import lombok.Builder;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Builder
public record ProductListFilter(
        @Schema(description = "Free-text search across name, SKU, and description")
        @Size(max = 200)
        String q,

        @Schema(description = "Filter by category ID (includes descendant categories)")
        UUID categoryId,

        @Schema(description = "Filter by category slug (includes descendant categories)")
        @Size(max = 200)
        String categorySlug,

        @Schema(description = "Filter by fabric ID")
        UUID fabricId,

        @Schema(description = "Filter by fabric slug")
        @Size(max = 200)
        String fabricSlug,

        @Schema(description = "Filter by print ID")
        UUID printId,

        @Schema(description = "Filter by print slug")
        @Size(max = 200)
        String printSlug,

        @Schema(description = "Filter by tag slugs")
        List<@Size(max = 100) String> tags,

        @Schema(description = "Minimum customer-facing price (INR)")
        @DecimalMin(value = "0", inclusive = true)
        BigDecimal minPrice,

        @Schema(description = "Maximum customer-facing price (INR)")
        @DecimalMin(value = "0", inclusive = true)
        BigDecimal maxPrice,

        @Schema(description = "When true, only products with an active offer or sale price")
        Boolean onOffer
) {
}
