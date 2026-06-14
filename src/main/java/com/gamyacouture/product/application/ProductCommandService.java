package com.gamyacouture.product.application;

import com.gamyacouture.catalog.domain.Category;
import com.gamyacouture.catalog.domain.Fabric;
import com.gamyacouture.catalog.domain.Print;
import com.gamyacouture.catalog.infrastructure.CategoryJpaRepository;
import com.gamyacouture.catalog.infrastructure.FabricJpaRepository;
import com.gamyacouture.catalog.infrastructure.PrintJpaRepository;
import com.gamyacouture.product.api.dto.ProductDetailDto;
import com.gamyacouture.product.api.dto.ProductImageInput;
import com.gamyacouture.product.api.dto.UpsertProductRequest;
import com.gamyacouture.product.config.ProductCacheNames;
import com.gamyacouture.product.domain.Product;
import com.gamyacouture.product.domain.ProductCategoryLink;
import com.gamyacouture.product.domain.ProductImage;
import com.gamyacouture.product.domain.ProductStatus;
import com.gamyacouture.product.infrastructure.ProductCategoryLinkJpaRepository;
import com.gamyacouture.product.infrastructure.ProductJpaRepository;
import com.gamyacouture.product.infrastructure.mapper.ProductMapper;
import com.gamyacouture.shared.exception.BusinessException;
import com.gamyacouture.shared.exception.ErrorCode;
import com.gamyacouture.shared.exception.ResourceNotFoundException;
import com.gamyacouture.shared.validation.ImageUrlValidator;
import com.gamyacouture.shared.validation.MediaUrlValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductCommandService {

    private final ProductJpaRepository productRepository;
    private final CategoryJpaRepository categoryRepository;
    private final FabricJpaRepository fabricRepository;
    private final PrintJpaRepository printRepository;
    private final ProductCategoryLinkJpaRepository categoryLinkRepository;
    private final ProductMapper productMapper;
    private final AdminProductQueryService adminProductQueryService;

    @CacheEvict(value = ProductCacheNames.CATEGORY_TREE, allEntries = true)
    public ProductDetailDto create(UpsertProductRequest request) {
        if (productRepository.existsBySku(request.sku())) {
            throw new BusinessException(ErrorCode.CONFLICT, "SKU already exists: " + request.sku());
        }

        Product product = new Product();
        product.setId(UUID.randomUUID());
        applyRequest(product, request);
        productRepository.save(product);
        syncCategoryLinks(product, request);
        return adminProductQueryService.findById(product.getId());
    }

    @CacheEvict(value = ProductCacheNames.PRODUCT_BY_ID, key = "#id")
    public ProductDetailDto update(UUID id, UpsertProductRequest request) {
        Product product = productRepository.findDetailedById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));

        if (productRepository.existsBySkuAndIdNot(request.sku(), id)) {
            throw new BusinessException(ErrorCode.CONFLICT, "SKU already exists: " + request.sku());
        }

        applyRequest(product, request);
        categoryLinkRepository.deleteByProductId(id);
        syncCategoryLinks(product, request);
        return adminProductQueryService.findById(id);
    }

    @CacheEvict(value = ProductCacheNames.PRODUCT_BY_ID, key = "#id")
    public ProductDetailDto updateStatus(UUID id, ProductStatus status) {
        Product product = productRepository.findDetailedById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
        product.setStatus(status);
        return adminProductQueryService.findById(id);
    }

    @CacheEvict(value = ProductCacheNames.PRODUCT_BY_ID, key = "#id")
    public void delete(UUID id) {
        Product product = productRepository.findDetailedById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
        product.setStatus(ProductStatus.ARCHIVED);
        product.setDeletedAt(Instant.now());
    }

    private void applyRequest(Product product, UpsertProductRequest request) {
        product.setSku(request.sku().trim());
        product.setName(request.name().trim());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setCompareAtPrice(request.compareAtPrice());
        product.setCurrency(request.currency() != null && !request.currency().isBlank()
                ? request.currency().trim().toUpperCase()
                : "INR");
        product.setStatus(request.status() != null ? request.status() : ProductStatus.DRAFT);
        product.setFabric(resolveFabric(request.fabricId()));
        product.setPrint(resolvePrint(request.printId()));
        product.setPrimaryCategory(resolveCategory(request.primaryCategoryId()));
        product.setStockQuantity(request.stockQuantity());
        product.setLowStockThreshold(request.lowStockThreshold() != null ? request.lowStockThreshold() : 5);
        applyImages(product, request.images());
        applyVideoUrl(product, request.videoUrl());
    }

    private void applyVideoUrl(Product product, String videoUrl) {
        if (videoUrl == null || videoUrl.isBlank()) {
            product.setVideoUrl(null);
            return;
        }
        MediaUrlValidator.validate(videoUrl);
        product.setVideoUrl(videoUrl.trim());
    }

    private void applyImages(Product product, List<ProductImageInput> images) {
        product.getImages().clear();
        if (images == null || images.isEmpty()) {
            return;
        }
        List<ProductImageInput> sorted = images.stream()
                .sorted(Comparator.comparingInt(ProductImageInput::displayOrder))
                .toList();
        for (ProductImageInput input : sorted) {
            ImageUrlValidator.validate(input.url());
            ProductImage image = ProductImage.builder()
                    .id(UUID.randomUUID())
                    .product(product)
                    .url(input.url().trim())
                    .altText(input.altText())
                    .displayOrder(input.displayOrder())
                    .build();
            product.getImages().add(image);
        }
    }

    private void syncCategoryLinks(Product product, UpsertProductRequest request) {
        Set<UUID> categoryIds = new LinkedHashSet<>();
        if (request.primaryCategoryId() != null) {
            categoryIds.add(request.primaryCategoryId());
        }
        if (request.categoryIds() != null) {
            categoryIds.addAll(request.categoryIds());
        }

        for (UUID categoryId : categoryIds) {
            resolveCategory(categoryId);
            categoryLinkRepository.save(ProductCategoryLink.builder()
                    .productId(product.getId())
                    .categoryId(categoryId)
                    .createdAt(Instant.now())
                    .build());
        }
    }

    private Category resolveCategory(UUID id) {
        if (id == null) {
            return null;
        }
        return categoryRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.VALIDATION_ERROR,
                        "Category not found or inactive: " + id));
    }

    private Fabric resolveFabric(UUID id) {
        if (id == null) {
            return null;
        }
        return fabricRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.VALIDATION_ERROR,
                        "Fabric not found or inactive: " + id));
    }

    private Print resolvePrint(UUID id) {
        if (id == null) {
            return null;
        }
        return printRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.VALIDATION_ERROR,
                        "Print not found or inactive: " + id));
    }
}
