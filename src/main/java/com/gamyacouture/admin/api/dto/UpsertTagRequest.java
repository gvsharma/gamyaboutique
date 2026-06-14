package com.gamyacouture.admin.api.dto;

import com.gamyacouture.catalog.domain.TagType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpsertTagRequest(
        @NotBlank @Size(max = 100) String name,
        @Size(max = 100) String slug,
        TagType tagType
) {
}
