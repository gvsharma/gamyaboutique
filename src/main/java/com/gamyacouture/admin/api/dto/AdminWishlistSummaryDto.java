package com.gamyacouture.admin.api.dto;

import java.time.Instant;
import java.util.UUID;

public record AdminWishlistSummaryDto(
        UUID id,
        UUID customerId,
        String customerName,
        String customerEmail,
        UUID productId,
        String productName,
        Instant createdAt
) {
}
