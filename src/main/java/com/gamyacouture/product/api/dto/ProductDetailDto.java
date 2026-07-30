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
        BigDecimal compareAtPrice,
        BigDecimal effectivePrice,
        boolean onOffer,
        String currency,
        ProductStatus status,
        UUID primaryCategoryId,
        FabricDto fabric,
        PrintDto print,
        OfferSummaryDto offer,
        List<TagDto> tags,
        List<CollectionSummaryDto> collections,
        List<CategorySummaryDto> categories,
        List<ProductImageDto> images,
        String videoUrl,
        Integer stockQuantity,
        Integer lowStockThreshold,
        boolean lowStock,
        List<String> availableSizes,
        List<ProductColorDto> availableColors
) {
}
