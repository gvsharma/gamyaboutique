package com.gamyacouture.site.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpsertPromoVideoRequest(
        @NotBlank @Size(max = 200) String title,
        String description,
        @NotBlank @Size(max = 500) String videoUrl,
        @Size(max = 500) String posterUrl,
        Integer displayOrder,
        Boolean active) {
}
