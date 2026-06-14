package com.gamyacouture.admin.api.dto;

import com.gamyacouture.cart.domain.CartStatus;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record AdminCartDetailDto(
        UUID id,
        UUID customerId,
        UUID guestToken,
        CartStatus status,
        Instant createdAt,
        Instant updatedAt,
        String customerEmail,
        String customerName,
        List<AdminCartItemDto> items
) {
}
