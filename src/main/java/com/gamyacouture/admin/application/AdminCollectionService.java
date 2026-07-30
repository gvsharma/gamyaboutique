package com.gamyacouture.admin.application;

import com.gamyacouture.admin.api.dto.AdminCollectionDto;
import com.gamyacouture.admin.api.dto.UpsertCollectionRequest;
import com.gamyacouture.catalog.domain.CollectionType;
import com.gamyacouture.catalog.domain.SeasonalCollection;
import com.gamyacouture.catalog.infrastructure.SeasonalCollectionJpaRepository;
import com.gamyacouture.shared.exception.BusinessException;
import com.gamyacouture.shared.exception.ErrorCode;
import com.gamyacouture.shared.exception.ResourceNotFoundException;
import com.gamyacouture.shared.util.SlugUtils;
import com.gamyacouture.shared.validation.ImageUrlValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminCollectionService {

    private final SeasonalCollectionJpaRepository collectionRepository;

    public List<AdminCollectionDto> listAll() {
        return collectionRepository.findAllByOrderByDisplayOrderAscNameAsc().stream()
                .map(this::toDto)
                .toList();
    }

    public AdminCollectionDto getById(UUID id) {
        return toDto(findById(id));
    }

    @Transactional
    public AdminCollectionDto create(UpsertCollectionRequest request) {
        SeasonalCollection collection = SeasonalCollection.builder().build();
        applyRequest(collection, request, true);
        collection.setId(UUID.randomUUID());
        return toDto(collectionRepository.save(collection));
    }

    @Transactional
    public AdminCollectionDto update(UUID id, UpsertCollectionRequest request) {
        SeasonalCollection collection = findById(id);
        applyRequest(collection, request, false);
        return toDto(collection);
    }

    @Transactional
    public void deactivate(UUID id) {
        if (!collectionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Collection not found: " + id);
        }
        collectionRepository.softDelete(id, Instant.now());
    }

    private SeasonalCollection findById(UUID id) {
        return collectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Collection not found: " + id));
    }

    private void applyRequest(SeasonalCollection collection, UpsertCollectionRequest request, boolean isCreate) {
        collection.setName(request.name().trim());
        if (isCreate) {
            collection.setSlug(resolveNewSlug(request.name(), request.slug()));
        } else {
            collection.setSlug(resolveSlugForUpdate(collection, request.slug()));
        }
        CollectionType type = request.collectionType();
        collection.setCollectionType(type);
        collection.setSeason(resolveSeason(request.season(), type));
        collection.setYear(resolveYear(request.year()));
        collection.setDescription(blankToNull(request.description()));
        collection.setStartsAt(request.startsAt());
        collection.setEndsAt(request.endsAt());
        if (request.imageUrl() != null && !request.imageUrl().isBlank()) {
            ImageUrlValidator.validate(request.imageUrl().trim());
            collection.setImageUrl(request.imageUrl().trim());
        } else {
            collection.setImageUrl(null);
        }
        collection.setDisplayOrder(request.displayOrder() != null ? request.displayOrder() : 0);
        if (request.active() != null) {
            collection.setActive(request.active());
        }
    }

    private String resolveNewSlug(String name, String slug) {
        String candidate = slug != null && !slug.isBlank() ? slug.trim() : SlugUtils.toSlug(name);
        if (collectionRepository.findBySlugAndDeletedAtIsNull(candidate).isPresent()) {
            throw new BusinessException(ErrorCode.CONFLICT, "Collection slug already exists: " + candidate);
        }
        return candidate;
    }

    private String resolveSlugForUpdate(SeasonalCollection collection, String slug) {
        if (slug == null || slug.isBlank()) {
            return collection.getSlug();
        }
        String candidate = slug.trim();
        if (!candidate.equals(collection.getSlug())
                && collectionRepository.findBySlugAndDeletedAtIsNull(candidate).isPresent()) {
            throw new BusinessException(ErrorCode.CONFLICT, "Collection slug already exists: " + candidate);
        }
        return candidate;
    }

    private String resolveSeason(String season, CollectionType type) {
        if (season != null && !season.isBlank()) {
            return season.trim();
        }
        return type.name();
    }

    private int resolveYear(Integer year) {
        return year != null ? year : LocalDate.now().getYear();
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private AdminCollectionDto toDto(SeasonalCollection collection) {
        return new AdminCollectionDto(
                collection.getId(),
                collection.getName(),
                collection.getSlug(),
                collection.getCollectionType(),
                collection.getSeason(),
                collection.getYear(),
                collection.getDescription(),
                collection.getStartsAt(),
                collection.getEndsAt(),
                collection.getImageUrl(),
                collection.getDisplayOrder(),
                collection.isActive());
    }
}
