package com.gamyacouture.admin.api.dto;

import com.gamyacouture.cart.domain.CartStatus;

import java.time.Instant;
import java.util.UUID;

public record AdminCartSummaryDto(
        UUID id,
        UUID customerId,
        UUID guestToken,
        CartStatus status,
        int itemCount,
        Instant updatedAt,
        String customerEmail,
        String customerName
) {
}
