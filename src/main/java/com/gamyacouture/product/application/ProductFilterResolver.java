package com.gamyacouture.product.application;

import com.gamyacouture.catalog.application.CategorySlugResolver;
import com.gamyacouture.catalog.domain.Category;
import com.gamyacouture.catalog.infrastructure.CategoryJpaRepository;
import com.gamyacouture.product.api.dto.ProductListFilter;
import com.gamyacouture.product.domain.repository.ProductFilter;
import com.gamyacouture.shared.exception.BusinessException;
import com.gamyacouture.shared.exception.ErrorCode;
import com.gamyacouture.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ProductFilterResolver {

    private final CategoryJpaRepository categoryRepository;
    private final CategorySlugResolver categorySlugResolver;

    public ProductFilter resolve(ProductListFilter request) {
        validatePriceRange(request.minPrice(), request.maxPrice());
        Set<UUID> categoryScope = resolveCategoryScope(request.categoryId(), request.categorySlug());

        return ProductFilter.builder()
                .search(request.q())
                .categoryId(request.categoryId())
                .categorySlug(request.categorySlug())
                .categoryIdsInSubtree(categoryScope)
                .fabricId(request.fabricId())
                .fabricSlug(request.fabricSlug())
                .printId(request.printId())
                .printSlug(request.printSlug())
                .tagSlugs(normalizeTags(request.tags()))
                .minPrice(request.minPrice())
                .maxPrice(request.maxPrice())
                .onOffer(request.onOffer())
                .build();
    }

    public ProductFilter resolveSearch(String query, ProductListFilter additionalFilters) {
        ProductListFilter merged = ProductListFilter.builder()
                .q(query)
                .categoryId(additionalFilters != null ? additionalFilters.categoryId() : null)
                .categorySlug(additionalFilters != null ? additionalFilters.categorySlug() : null)
                .fabricId(additionalFilters != null ? additionalFilters.fabricId() : null)
                .fabricSlug(additionalFilters != null ? additionalFilters.fabricSlug() : null)
                .printId(additionalFilters != null ? additionalFilters.printId() : null)
                .printSlug(additionalFilters != null ? additionalFilters.printSlug() : null)
                .tags(additionalFilters != null ? additionalFilters.tags() : null)
                .minPrice(additionalFilters != null ? additionalFilters.minPrice() : null)
                .maxPrice(additionalFilters != null ? additionalFilters.maxPrice() : null)
                .onOffer(additionalFilters != null ? additionalFilters.onOffer() : null)
                .build();
        return resolve(merged);
    }

    private Set<UUID> resolveCategoryScope(UUID categoryId, String categorySlug) {
        Category category;
        if (categoryId != null) {
            category = categoryRepository.findByIdAndActiveTrue(categoryId)
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + categoryId));
        } else if (categorySlug != null && !categorySlug.isBlank()) {
            category = categorySlugResolver.resolveActiveBySlug(categorySlug.trim());
        } else {
            return null;
        }
        return categoryRepository.findActiveIdsInSubtree(category.getPath());
    }

    private static List<String> normalizeTags(List<String> tags) {
        if (tags == null || tags.isEmpty()) {
            return List.of();
        }
        return tags.stream()
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(String::toLowerCase)
                .distinct()
                .toList();
    }

    private static void validatePriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        if (minPrice != null && maxPrice != null && minPrice.compareTo(maxPrice) > 0) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "minPrice must be less than or equal to maxPrice");
        }
    }
}
