package com.gamyacouture.product.api.dto;

import com.gamyacouture.catalog.domain.CollectionType;

import java.util.UUID;

public record CollectionSummaryDto(
        UUID id,
        String name,
        String slug,
        CollectionType collectionType
) {
}
