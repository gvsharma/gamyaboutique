package com.gamyacouture.catalog.application;

import com.gamyacouture.catalog.api.dto.CategoryDto;
import com.gamyacouture.catalog.domain.Category;
import com.gamyacouture.catalog.infrastructure.CategoryJpaRepository;
import com.gamyacouture.catalog.infrastructure.mapper.CategoryMapper;
import com.gamyacouture.product.api.ProductQueryApi;
import com.gamyacouture.product.api.dto.ProductSummaryDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryBrowseService {

    private final CategoryJpaRepository categoryRepository;
    private final CategoryMapper categoryMapper;
    private final ProductQueryApi productQueryApi;
    private final CategorySlugResolver categorySlugResolver;

    public List<CategoryDto> listActiveCategories() {
        return categoryRepository.findByActiveTrueOrderByDisplayOrderAscNameAsc().stream()
                .map(categoryMapper::toDto)
                .toList();
    }

    public Page<ProductSummaryDto> productsBySlug(String slug, Pageable pageable) {
        Category category = categorySlugResolver.resolveActiveBySlug(slug);
        return productQueryApi.findByCategory(category.getId(), pageable);
    }
}
