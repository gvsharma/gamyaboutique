package com.gamyacouture.product.api.dto;

import com.gamyacouture.product.domain.ProductStatus;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ProductDetailDto(
        UUID id,
        String sku,
        String name,
        String description,
        BigDecimal price,
        String currency,
        ProductStatus status,
        List<ProductImageDto> images,
        List<UUID> categoryIds
) {
}
