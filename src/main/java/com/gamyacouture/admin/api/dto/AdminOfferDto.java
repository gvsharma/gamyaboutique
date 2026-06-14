package com.gamyacouture.admin.api.dto;

import com.gamyacouture.catalog.domain.DiscountType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record AdminOfferDto(
        UUID id,
        String name,
        String code,
        String description,
        DiscountType discountType,
        BigDecimal discountValue,
        Instant startsAt,
        Instant endsAt,
        boolean active
) {
}
