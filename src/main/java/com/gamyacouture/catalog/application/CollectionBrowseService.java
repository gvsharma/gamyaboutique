package com.gamyacouture.catalog.application;

import com.gamyacouture.catalog.api.dto.CollectionDto;
import com.gamyacouture.catalog.domain.SeasonalCollection;
import com.gamyacouture.catalog.infrastructure.SeasonalCollectionJpaRepository;
import com.gamyacouture.product.api.dto.ProductSummaryDto;
import com.gamyacouture.product.domain.Product;
import com.gamyacouture.product.domain.ProductStatus;
import com.gamyacouture.product.infrastructure.ProductJpaRepository;
import com.gamyacouture.product.infrastructure.mapper.ProductMapper;
import com.gamyacouture.shared.exception.ResourceNotFoundException;
import com.gamyacouture.shared.web.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CollectionBrowseService {

    private final SeasonalCollectionJpaRepository collectionRepository;
    private final ProductJpaRepository productRepository;
    private final ProductMapper productMapper;

    public List<CollectionDto> listVisibleCollections() {
        return collectionRepository.findCurrentlyVisible(LocalDate.now()).stream()
                .map(this::toDto)
                .toList();
    }

    public CollectionDto getBySlug(String slug) {
        SeasonalCollection collection = collectionRepository.findBySlugAndDeletedAtIsNull(slug)
                .filter(SeasonalCollection::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Collection not found: " + slug));
        return toDto(collection);
    }

    public Page<ProductSummaryDto> productsBySlug(String slug, Pageable pageable) {
        if (!collectionRepository.findBySlugAndDeletedAtIsNull(slug).isPresent()) {
            throw new ResourceNotFoundException("Collection not found: " + slug);
        }
        Page<Product> page = productRepository.findActiveByCollectionSlug(slug, ProductStatus.ACTIVE, pageable);
        return page.map(productMapper::toSummary);
    }

    public PageResponse<ProductSummaryDto> productsPageBySlug(String slug, Pageable pageable) {
        return PageResponse.from(productsBySlug(slug, pageable));
    }

    private CollectionDto toDto(SeasonalCollection collection) {
        return new CollectionDto(
                collection.getId(),
                collection.getName(),
                collection.getSlug(),
                collection.getCollectionType(),
                collection.getDescription(),
                collection.getStartsAt(),
                collection.getEndsAt(),
                collection.getImageUrl(),
                collection.getDisplayOrder());
    }
}
