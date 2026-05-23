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
        FabricDto fabric,
        PrintDto print,
        OfferSummaryDto offer,
        List<TagDto> tags,
        List<CategorySummaryDto> categories,
        List<ProductImageDto> images
) {
}
