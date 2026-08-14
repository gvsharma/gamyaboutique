package com.gamyacouture.product.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record BulkProductImportRequest(
        @NotEmpty @Valid List<UpsertProductRequest> products
) {
}
