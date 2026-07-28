package com.gamyacouture.product.api.dto;

import java.util.List;

public record BulkProductImportResultDto(
        int requested,
        int created,
        int failed,
        List<BulkProductImportFailureDto> failures
) {
}
