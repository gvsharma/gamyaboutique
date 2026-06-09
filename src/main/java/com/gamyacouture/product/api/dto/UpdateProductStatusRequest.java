package com.gamyacouture.product.api.dto;

import com.gamyacouture.product.domain.ProductStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateProductStatusRequest(
        @NotNull ProductStatus status
) {
}
