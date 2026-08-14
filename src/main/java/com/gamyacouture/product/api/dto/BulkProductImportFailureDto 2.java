package com.gamyacouture.product.api.dto;

public record BulkProductImportFailureDto(
        String sku,
        String message
) {
}
