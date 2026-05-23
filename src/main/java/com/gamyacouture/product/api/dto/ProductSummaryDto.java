package com.gamyacouture.product.api.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ProductSummaryDto(
        UUID id,
        String sku,
        String name,
        BigDecimal price,
        BigDecimal compareAtPrice,
        BigDecimal effectivePrice,
        boolean onOffer,
        String currency,
        String primaryImageUrl,
        FabricDto fabric,
        PrintDto print,
        OfferSummaryDto offer,
        List<TagDto> tags
) {
}
