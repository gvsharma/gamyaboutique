package com.gamyacouture.product.application;

import com.gamyacouture.catalog.application.CategoryTaxonomy;
import com.gamyacouture.catalog.domain.Category;
import com.gamyacouture.catalog.domain.Fabric;
import com.gamyacouture.catalog.domain.Print;
import com.gamyacouture.catalog.domain.SeasonalCollection;
import com.gamyacouture.catalog.domain.Tag;
import com.gamyacouture.catalog.infrastructure.CategoryJpaRepository;
import com.gamyacouture.catalog.infrastructure.FabricJpaRepository;
import com.gamyacouture.catalog.infrastructure.PrintJpaRepository;
import com.gamyacouture.catalog.infrastructure.SeasonalCollectionJpaRepository;
import com.gamyacouture.catalog.infrastructure.TagJpaRepository;
import com.gamyacouture.product.api.dto.ProductDetailDto;
import com.gamyacouture.product.api.dto.ProductImageInput;
import com.gamyacouture.product.api.dto.UpsertProductRequest;
import com.gamyacouture.product.config.ProductCacheNames;
import com.gamyacouture.product.application.ProductOptionsCodec;
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

import java.math.BigDecimal;
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
    private final TagJpaRepository tagRepository;
    private final SeasonalCollectionJpaRepository collectionRepository;
    private final ProductMapper productMapper;
    private final AdminProductQueryService adminProductQueryService;

    @CacheEvict(value = ProductCacheNames.CATEGORY_TREE, allEntries = true)
    public ProductDetailDto create(UpsertProductRequest request) {
        String sku = resolveSkuForCreate(request);
        if (productRepository.existsBySku(sku)) {
            throw new BusinessException(ErrorCode.CONFLICT, "SKU already exists: " + sku);
        }

        Product product = new Product();
        product.setId(UUID.randomUUID());
        applyRequest(product, withSku(request, sku));
        productRepository.save(product);
        syncCategoryLinks(product, request);
        return adminProductQueryService.findById(product.getId());
    }

    @CacheEvict(value = ProductCacheNames.PRODUCT_BY_ID, key = "#id")
    public ProductDetailDto update(UUID id, UpsertProductRequest request) {
        Product product = productRepository.findDetailedById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));

        if (request.sku() == null || request.sku().isBlank()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "SKU is required when updating a product");
        }

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
        product.setPrice(resolvePrice(request.price()));
        product.setCompareAtPrice(request.compareAtPrice());
        product.setCurrency(request.currency() != null && !request.currency().isBlank()
                ? request.currency().trim().toUpperCase()
                : "INR");
        product.setStatus(request.status() != null ? request.status() : ProductStatus.DRAFT);
        validatePublishRequirements(product, request);
        product.setFabric(resolveFabric(request.fabricId()));
        product.setPrint(resolvePrint(request.printId()));
        product.setPrimaryCategory(resolveCategory(request.primaryCategoryId()));
        product.setStockQuantity(request.stockQuantity());
        product.setLowStockThreshold(request.lowStockThreshold() != null ? request.lowStockThreshold() : 5);
        product.setAvailableSizes(ProductOptionsCodec.encodeSizes(request.availableSizes()));
        product.setAvailableColors(ProductOptionsCodec.encodeColors(request.availableColors()));
        applyImages(product, request.images());
        applyVideoUrl(product, request.videoUrl());
        applyTags(product, request.tagIds());
        applyCollections(product, request.collectionIds());
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

    private BigDecimal resolvePrice(BigDecimal price) {
        if (price == null || price.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ONE;
        }
        return price;
    }

    private void validatePublishRequirements(Product product, UpsertProductRequest request) {
        ProductStatus status = request.status() != null ? request.status() : product.getStatus();
        if (status != ProductStatus.ACTIVE) {
            return;
        }
        UUID categoryId = request.primaryCategoryId() != null
                ? request.primaryCategoryId()
                : product.getPrimaryCategory() != null ? product.getPrimaryCategory().getId() : null;
        if (categoryId == null) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                    "Select a product type before publishing.");
        }
        BigDecimal price = request.price() != null ? request.price() : product.getPrice();
        if (price == null || price.compareTo(BigDecimal.ONE) < 0) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                    "Set a price before publishing.");
        }
    }

    private void applyTags(Product product, List<UUID> tagIds) {
        if (tagIds == null) {
            return;
        }
        product.getTags().clear();
        if (tagIds.isEmpty()) {
            return;
        }
        List<Tag> tags = tagRepository.findAllById(tagIds);
        if (tags.size() != tagIds.size()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "One or more tags were not found");
        }
        product.getTags().addAll(tags);
    }

    private void applyCollections(Product product, List<UUID> collectionIds) {
        if (collectionIds == null) {
            return;
        }
        product.getSeasonalCollections().clear();
        if (collectionIds.isEmpty()) {
            return;
        }
        List<SeasonalCollection> collections = collectionRepository.findAllById(collectionIds);
        if (collections.size() != collectionIds.size()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "One or more collections were not found");
        }
        for (SeasonalCollection collection : collections) {
            if (!collection.isActive()) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                        "Collection not found or inactive: " + collection.getSlug());
            }
        }
        product.getSeasonalCollections().addAll(collections);
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
        Category category = categoryRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.VALIDATION_ERROR,
                        "Category not found or inactive: " + id));
        CategoryTaxonomy.validateProductCategory(category);
        return category;
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

    private String resolveSkuForCreate(UpsertProductRequest request) {
        if (request.sku() != null && !request.sku().isBlank()) {
            return request.sku().trim();
        }
        String categorySlug = null;
        if (request.primaryCategoryId() != null) {
            categorySlug = categoryRepository.findByIdAndActiveTrue(request.primaryCategoryId())
                    .map(Category::getSlug)
                    .orElse(null);
        }
        return ProductSkuGenerator.generate(productRepository, request.name(), categorySlug);
    }

    private static UpsertProductRequest withSku(UpsertProductRequest request, String sku) {
        return new UpsertProductRequest(
                sku,
                request.name(),
                request.description(),
                request.price(),
                request.compareAtPrice(),
                request.currency(),
                request.status(),
                request.primaryCategoryId(),
                request.fabricId(),
                request.printId(),
                request.categoryIds(),
                request.images(),
                request.videoUrl(),
                request.stockQuantity(),
                request.lowStockThreshold(),
                request.availableSizes(),
                request.availableColors(),
                request.tagIds(),
                request.collectionIds());
    }
}
