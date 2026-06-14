package com.gamyacouture.product.api.dto;

import com.gamyacouture.product.domain.ProductStatus;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ProductSummaryDto(
        UUID id,
        String sku,
        String name,
        ProductStatus status,
        BigDecimal price,
        BigDecimal compareAtPrice,
        BigDecimal effectivePrice,
        boolean onOffer,
        String currency,
        String primaryImageUrl,
        String primaryCategorySlug,
        FabricDto fabric,
        PrintDto print,
        OfferSummaryDto offer,
        List<TagDto> tags
) {
}
