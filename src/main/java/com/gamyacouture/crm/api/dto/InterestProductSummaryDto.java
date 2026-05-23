package com.gamyacouture.crm.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(description = "Product summary on an interest record")
public record InterestProductSummaryDto(
        UUID id,
        String name,
        String sku
) {
}
