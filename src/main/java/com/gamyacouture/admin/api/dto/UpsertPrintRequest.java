package com.gamyacouture.admin.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpsertPrintRequest(
        @NotBlank @Size(max = 200) String name,
        @Size(max = 200) String slug,
        String description,
        @Size(max = 50) String patternType,
        Boolean active
) {
}
