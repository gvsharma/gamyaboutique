package com.gamyacouture.cart.api.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CartDto(
        UUID id,
        UUID guestToken,
        int itemCount,
        BigDecimal subtotal,
        String currency,
        List<CartItemDto> items
) {
}
