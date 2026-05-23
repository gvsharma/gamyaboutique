package com.gamyacouture.crm.api.dto;

import com.gamyacouture.crm.domain.CustomerInterestStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

@Schema(description = "Customer product interest lead")
public record CustomerInterestDto(
        UUID id,
        InterestProductSummaryDto product,
        String customerName,
        String phone,
        String whatsapp,
        String size,
        String color,
        String message,
        CustomerInterestStatus status,
        Instant createdAt,
        Instant updatedAt
) {
}
