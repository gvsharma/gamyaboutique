package com.gamyacouture.admin.api.dto;

import java.time.Instant;
import java.util.UUID;

public record AdminCustomerSummaryDto(
        UUID id,
        String email,
        String phone,
        String firstName,
        String lastName,
        UUID userId,
        Instant createdAt
) {
}
