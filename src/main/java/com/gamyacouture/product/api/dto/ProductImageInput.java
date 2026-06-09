package com.gamyacouture.product.api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProductImageInput(
        @NotBlank @Size(max = 500) String url,
        @Size(max = 300) String altText,
        @Min(0) int displayOrder
) {
}
