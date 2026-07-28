package com.gamyacouture.product.api.dto;

import com.gamyacouture.product.domain.ProductStatus;

import java.math.BigDecimal;
import java.util.List;

public record BulkProductRowPreviewDto(
        int rowNumber,
        String sku,
        String name,
        String description,
        BigDecimal price,
        BigDecimal compareAtPrice,
        String currency,
        ProductStatus status,
        String categorySlug,
        String fabricSlug,
        String printSlug,
        Integer stockQuantity,
        Integer lowStockThreshold,
        String sizes,
        String colors,
        String imageUrls,
        String videoUrl,
        boolean valid,
        List<String> errors,
        UpsertProductRequest product
) {
}
