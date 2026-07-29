package com.gamyacouture.site.application;

import com.gamyacouture.catalog.api.dto.CollectionDto;
import com.gamyacouture.catalog.application.CollectionBrowseService;
import com.gamyacouture.product.api.dto.ProductSummaryDto;
import com.gamyacouture.product.domain.Product;
import com.gamyacouture.product.domain.ProductStatus;
import com.gamyacouture.product.infrastructure.ProductJpaRepository;
import com.gamyacouture.product.infrastructure.mapper.ProductMapper;
import com.gamyacouture.shared.exception.ResourceNotFoundException;
import com.gamyacouture.shared.validation.ImageUrlValidator;
import com.gamyacouture.site.api.dto.HomepageDto;
import com.gamyacouture.site.api.dto.HomepageSlotDto;
import com.gamyacouture.site.api.dto.UpsertHomepageSlotRequest;
import com.gamyacouture.site.domain.HomepageSlot;
import com.gamyacouture.site.domain.HomepageSlotKey;
import com.gamyacouture.site.infrastructure.HomepageSlotJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HomepageService {

    private final HomepageSlotJpaRepository slotRepository;
    private final CollectionBrowseService collectionBrowseService;
    private final ProductJpaRepository productRepository;
    private final ProductMapper productMapper;

    @Transactional(readOnly = true)
    public HomepageDto getPublicHomepage() {
        HomepageSlot featuredSlot = requireSlot(HomepageSlotKey.FEATURED_COLLECTION);
        HomepageSlot curatedSlot = requireSlot(HomepageSlotKey.CURATED_EDIT);

        CollectionDto featuredCollection = null;
        if (featuredSlot.isActive() && featuredSlot.getCollectionSlug() != null
                && !featuredSlot.getCollectionSlug().isBlank()) {
            try {
                featuredCollection = collectionBrowseService.getBySlug(featuredSlot.getCollectionSlug().trim());
            } catch (ResourceNotFoundException ignored) {
                featuredCollection = null;
            }
        }

        List<ProductSummaryDto> curatedProducts = resolveCuratedProducts(curatedSlot);

        return new HomepageDto(
                toDto(featuredSlot),
                featuredCollection,
                toDto(curatedSlot),
                curatedProducts);
    }

    @Transactional(readOnly = true)
    public List<HomepageSlotDto> listSlots() {
        return slotRepository.findAllByOrderBySlotKeyAsc().stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public HomepageSlotDto upsertSlot(HomepageSlotKey key, UpsertHomepageSlotRequest request) {
        HomepageSlot slot = slotRepository.findById(key).orElseGet(() -> {
            HomepageSlot created = new HomepageSlot();
            created.setSlotKey(key);
            return created;
        });

        if (request.title() != null) {
            slot.setTitle(blankToNull(request.title()));
        }
        if (request.subtitle() != null) {
            slot.setSubtitle(blankToNull(request.subtitle()));
        }
        if (request.body() != null) {
            slot.setBody(blankToNull(request.body()));
        }
        if (request.imageUrl() != null) {
            String imageUrl = blankToNull(request.imageUrl());
            if (imageUrl != null) {
                ImageUrlValidator.validate(imageUrl);
            }
            slot.setImageUrl(imageUrl);
        }
        if (request.collectionSlug() != null) {
            slot.setCollectionSlug(blankToNull(request.collectionSlug()));
        }
        if (request.productIds() != null) {
            slot.setProductIds(new ArrayList<>(request.productIds()));
        }
        if (request.active() != null) {
            slot.setActive(request.active());
        }
        slot.setUpdatedAt(Instant.now());
        slotRepository.save(slot);
        return toDto(slot);
    }

    private HomepageSlot requireSlot(HomepageSlotKey key) {
        return slotRepository.findById(key)
                .orElseThrow(() -> new ResourceNotFoundException("Homepage slot not found: " + key));
    }

    private List<ProductSummaryDto> resolveCuratedProducts(HomepageSlot slot) {
        if (!slot.isActive()) {
            return List.of();
        }
        if (slot.getProductIds() != null && !slot.getProductIds().isEmpty()) {
            return resolveProductsByIds(slot.getProductIds());
        }
        if (slot.getCollectionSlug() != null && !slot.getCollectionSlug().isBlank()) {
            try {
                return collectionBrowseService
                        .productsBySlug(slot.getCollectionSlug().trim(), PageRequest.of(0, 8))
                        .getContent();
            } catch (ResourceNotFoundException ignored) {
                return List.of();
            }
        }
        return productRepository.findByStatus(ProductStatus.ACTIVE, PageRequest.of(0, 8))
                .map(productMapper::toSummary)
                .getContent();
    }

    private List<ProductSummaryDto> resolveProductsByIds(List<UUID> ids) {
        List<Product> found = productRepository.findAllById(ids);
        Map<UUID, Product> byId = new LinkedHashMap<>();
        for (Product product : found) {
            if (product.getStatus() == ProductStatus.ACTIVE && product.getDeletedAt() == null) {
                byId.put(product.getId(), product);
            }
        }
        List<ProductSummaryDto> ordered = new ArrayList<>();
        for (UUID id : ids) {
            Product product = byId.get(id);
            if (product != null) {
                ordered.add(productMapper.toSummary(product));
            }
        }
        return ordered;
    }

    private HomepageSlotDto toDto(HomepageSlot slot) {
        return new HomepageSlotDto(
                slot.getSlotKey(),
                slot.getTitle(),
                slot.getSubtitle(),
                slot.getBody(),
                slot.getImageUrl(),
                slot.getCollectionSlug(),
                slot.getProductIds() != null ? List.copyOf(slot.getProductIds()) : List.of(),
                slot.isActive());
    }

    private static String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
