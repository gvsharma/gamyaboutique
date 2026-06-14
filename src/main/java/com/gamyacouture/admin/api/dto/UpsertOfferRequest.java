package com.gamyacouture.admin.api.dto;

import com.gamyacouture.catalog.domain.DiscountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;

public record UpsertOfferRequest(
        @NotBlank @Size(max = 200) String name,
        @Size(max = 50) String code,
        String description,
        @NotNull DiscountType discountType,
        @NotNull BigDecimal discountValue,
        Instant startsAt,
        Instant endsAt,
        Boolean active
) {
}
