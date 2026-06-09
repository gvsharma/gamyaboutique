package com.gamyacouture.product.application;

import com.gamyacouture.catalog.domain.Category;
import com.gamyacouture.catalog.infrastructure.CategoryJpaRepository;
import com.gamyacouture.product.api.dto.AdminProductListFilter;
import com.gamyacouture.product.api.dto.CategorySummaryDto;
import com.gamyacouture.product.api.dto.ProductDetailDto;
import com.gamyacouture.product.api.dto.ProductSummaryDto;
import com.gamyacouture.product.domain.Product;
import com.gamyacouture.product.domain.ProductCategoryLink;
import com.gamyacouture.product.infrastructure.ProductCategoryLinkJpaRepository;
import com.gamyacouture.product.infrastructure.ProductJpaRepository;
import com.gamyacouture.product.infrastructure.mapper.ProductMapper;
import com.gamyacouture.product.infrastructure.persistence.AdminProductSpecifications;
import com.gamyacouture.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminProductQueryService {

    private final ProductJpaRepository productRepository;
    private final ProductCategoryLinkJpaRepository categoryLinkRepository;
    private final CategoryJpaRepository categoryRepository;
    private final ProductMapper productMapper;

    public Page<ProductSummaryDto> list(AdminProductListFilter filter, Pageable pageable) {
        Pageable safePageable = ProductPageableSupport.sanitize(pageable);
        return productRepository
                .findAll(AdminProductSpecifications.fromFilter(filter), safePageable)
                .map(productMapper::toSummary);
    }

    public ProductDetailDto findById(UUID id) {
        Product product = productRepository.findDetailedById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
        return productMapper.toDetail(product, loadCategories(id));
    }

    private List<CategorySummaryDto> loadCategories(UUID productId) {
        List<UUID> categoryIds = categoryLinkRepository.findByProductId(productId).stream()
                .map(ProductCategoryLink::getCategoryId)
                .distinct()
                .toList();
        if (categoryIds.isEmpty()) {
            return List.of();
        }
        return categoryRepository.findAllById(categoryIds).stream()
                .map(productMapper::toCategorySummary)
                .toList();
    }
}
