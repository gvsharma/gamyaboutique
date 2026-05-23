package com.gamyacouture.product.api.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record ProductSummaryDto(
        UUID id,
        String sku,
        String name,
        BigDecimal price,
        String currency,
        String primaryImageUrl
) {
}
