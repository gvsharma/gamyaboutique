package com.gamyacouture.product.api.dto;

import com.gamyacouture.catalog.domain.DiscountType;

import java.math.BigDecimal;
import java.util.UUID;

public record OfferSummaryDto(
        UUID id,
        String name,
        String code,
        DiscountType discountType,
        BigDecimal discountValue
) {
}
