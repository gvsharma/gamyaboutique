package com.gamyacouture.admin.api.dto;

import java.time.Instant;
import java.util.UUID;

public record AdminCustomerDetailDto(
        UUID id,
        String email,
        String phone,
        String firstName,
        String lastName,
        String notes,
        UUID userId,
        Instant createdAt,
        Instant updatedAt,
        long wishlistCount,
        long cartCount
) {
}
