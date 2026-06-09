package com.gamyacouture.product.api.dto;

import com.gamyacouture.product.domain.ProductStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record UpsertProductRequest(
        @NotBlank @Size(max = 100) String sku,
        @NotBlank @Size(max = 300) String name,
        String description,
        @NotNull @DecimalMin("0.01") BigDecimal price,
        @DecimalMin("0.01") BigDecimal compareAtPrice,
        @Size(max = 3) String currency,
        ProductStatus status,
        UUID primaryCategoryId,
        UUID fabricId,
        UUID printId,
        List<UUID> categoryIds,
        @Valid List<ProductImageInput> images
) {
}
