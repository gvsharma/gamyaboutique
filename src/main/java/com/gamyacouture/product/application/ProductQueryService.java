package com.gamyacouture.product.application;

import com.gamyacouture.product.api.ProductQueryApi;
import com.gamyacouture.product.api.dto.ProductDetailDto;
import com.gamyacouture.product.api.dto.ProductSummaryDto;
import com.gamyacouture.product.domain.Product;
import com.gamyacouture.product.domain.ProductCategoryLink;
import com.gamyacouture.product.domain.ProductStatus;
import com.gamyacouture.product.infrastructure.ProductCategoryLinkJpaRepository;
import com.gamyacouture.product.infrastructure.ProductJpaRepository;
import com.gamyacouture.product.infrastructure.mapper.ProductMapper;
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
public class ProductQueryService implements ProductQueryApi {

    private final ProductJpaRepository productRepository;
    private final ProductCategoryLinkJpaRepository categoryLinkRepository;
    private final ProductMapper productMapper;

    @Override
    public ProductDetailDto findById(UUID id) {
        Product product = productRepository.findByIdAndStatus(id, ProductStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
        List<UUID> categoryIds = categoryLinkRepository.findByProductId(id).stream()
                .map(ProductCategoryLink::getCategoryId)
                .toList();
        return productMapper.toDetail(product, categoryIds);
    }

    @Override
    public Page<ProductSummaryDto> findByCategory(UUID categoryId, Pageable pageable) {
        return productRepository.findActiveByCategory(categoryId, ProductStatus.ACTIVE, pageable)
                .map(productMapper::toSummary);
    }

    @Override
    public Page<ProductSummaryDto> findActive(Pageable pageable) {
        return productRepository.findByStatus(ProductStatus.ACTIVE, pageable)
                .map(productMapper::toSummary);
    }
}
