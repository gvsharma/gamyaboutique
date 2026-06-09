package com.gamyacouture.product.api.dto;

import com.gamyacouture.product.domain.ProductStatus;

public record AdminProductListFilter(
        ProductStatus status,
        String search
) {
}
