package com.gamyacouture.admin.api.dto;

import com.gamyacouture.catalog.domain.TagType;

import java.util.UUID;

public record AdminTagDto(
        UUID id,
        String name,
        String slug,
        TagType tagType
) {
}
