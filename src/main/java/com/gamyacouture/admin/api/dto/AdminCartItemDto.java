package com.gamyacouture.admin.api.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record AdminCartItemDto(
        UUID id,
        UUID productId,
        String productName,
        String sku,
        int quantity,
        BigDecimal price
) {
}
