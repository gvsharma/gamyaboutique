package com.gamyacouture.product.application;

import com.gamyacouture.catalog.domain.Category;
import com.gamyacouture.catalog.infrastructure.CategoryJpaRepository;
import com.gamyacouture.product.api.ProductQueryApi;
import com.gamyacouture.product.api.dto.CategorySummaryDto;
import com.gamyacouture.product.api.dto.ProductDetailDto;
import com.gamyacouture.product.api.dto.ProductListFilter;
import com.gamyacouture.product.api.dto.ProductSummaryDto;
import com.gamyacouture.product.config.ProductCacheNames;
import com.gamyacouture.product.domain.Product;
import com.gamyacouture.product.domain.ProductCategoryLink;
import com.gamyacouture.product.domain.repository.ProductFilter;
import com.gamyacouture.product.domain.repository.ProductRepository;
import com.gamyacouture.product.infrastructure.ProductCategoryLinkJpaRepository;
import com.gamyacouture.product.infrastructure.mapper.ProductMapper;
import com.gamyacouture.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductQueryService implements ProductQueryApi {

    private final ProductRepository productRepository;
    private final ProductFilterResolver filterResolver;
    private final ProductMapper productMapper;
    private final ProductCategoryLinkJpaRepository categoryLinkRepository;
    private final CategoryJpaRepository categoryJpaRepository;

    @Override
    @Cacheable(value = ProductCacheNames.PRODUCT_BY_ID, key = "#id")
    public ProductDetailDto findById(UUID id) {
        Product product = productRepository.findActiveWithDetailsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
        return productMapper.toDetail(product, loadCategories(id));
    }

    @Override
    public Page<ProductSummaryDto> list(ProductListFilter filter, Pageable pageable) {
        ProductFilter resolved = filterResolver.resolve(filter);
        return searchInternal(resolved, pageable);
    }

    @Override
    public Page<ProductSummaryDto> search(String query, ProductListFilter filter, Pageable pageable) {
        ProductFilter resolved = filterResolver.resolveSearch(query, filter);
        return searchInternal(resolved, pageable);
    }

    @Override
    public Page<ProductSummaryDto> findByCategory(UUID categoryId, Pageable pageable) {
        ProductListFilter filter = ProductListFilter.builder().categoryId(categoryId).build();
        return list(filter, pageable);
    }

    @Override
    public Page<ProductSummaryDto> findActive(Pageable pageable) {
        return list(ProductListFilter.builder().build(), pageable);
    }

    private Page<ProductSummaryDto> searchInternal(ProductFilter filter, Pageable pageable) {
        Pageable safePageable = ProductPageableSupport.sanitize(pageable);
        return productRepository.findAll(filter, safePageable).map(productMapper::toSummary);
    }

    private List<CategorySummaryDto> loadCategories(UUID productId) {
        List<UUID> categoryIds = categoryLinkRepository.findByProductId(productId).stream()
                .map(ProductCategoryLink::getCategoryId)
                .distinct()
                .toList();
        if (categoryIds.isEmpty()) {
            return List.of();
        }
        return categoryJpaRepository.findAllById(categoryIds).stream()
                .filter(Category::isActive)
                .map(productMapper::toCategorySummary)
                .toList();
    }
}
