package com.gamyacouture.product.domain.repository;

import lombok.Builder;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Builder
public record ProductFilter(
        String search,
        UUID categoryId,
        String categorySlug,
        Set<UUID> categoryIdsInSubtree,
        UUID fabricId,
        String fabricSlug,
        UUID printId,
        String printSlug,
        List<String> tagSlugs,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        Boolean onOffer
) {
    public boolean hasSearch() {
        return search != null && !search.isBlank();
    }
}
