package com.gamyacouture.product.api.dto;

import java.util.List;

public record BulkProductPreviewResponse(
        int totalRows,
        int validRows,
        int invalidRows,
        List<String> requiredColumns,
        List<BulkProductRowPreviewDto> rows
) {
}
