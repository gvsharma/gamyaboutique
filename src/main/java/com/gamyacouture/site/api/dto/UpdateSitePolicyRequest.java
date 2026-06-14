package com.gamyacouture.site.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateSitePolicyRequest(
        @NotBlank @Size(max = 200) String title,
        @NotBlank String content
) {
}
