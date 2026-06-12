package com.gamyacouture.cart.api.dto;

import com.gamyacouture.product.api.dto.ProductSummaryDto;

import java.util.UUID;

public record CartItemDto(
        UUID id,
        UUID productId,
        int quantity,
        String selectedSize,
        String selectedColor,
        ProductSummaryDto product
) {
}
