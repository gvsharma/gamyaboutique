package com.gamyacouture.product.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProductColorDto(
        @NotBlank @Size(max = 50) String name,
        @Size(max = 20) String hex
) {
}
