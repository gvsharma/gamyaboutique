package com.gamyacouture.catalog.application;

import com.gamyacouture.catalog.api.dto.CategoryDto;
import com.gamyacouture.catalog.api.dto.UpsertCategoryRequest;
import com.gamyacouture.catalog.domain.Category;
import com.gamyacouture.catalog.infrastructure.CategoryJpaRepository;
import com.gamyacouture.product.config.ProductCacheNames;
import com.gamyacouture.shared.exception.BusinessException;
import com.gamyacouture.shared.exception.ErrorCode;
import com.gamyacouture.shared.exception.ResourceNotFoundException;
import com.gamyacouture.shared.util.SlugUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryCommandService {

    private final CategoryJpaRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<CategoryDto> listAll() {
        return categoryRepository.findAllByOrderByDisplayOrderAscNameAsc().stream()
                .map(this::toDto)
                .toList();
    }

    @Caching(evict = {
            @CacheEvict(value = ProductCacheNames.CATEGORY_TREE, allEntries = true),
            @CacheEvict(value = ProductCacheNames.PRODUCT_BY_ID, allEntries = true)
    })
    public CategoryDto create(UpsertCategoryRequest request) {
        Category parent = resolveParent(request.parentId());
        String slug = resolveSlug(request.name(), request.slug(), parent, null);
        Category category = Category.builder()
                .id(UUID.randomUUID())
                .name(request.name().trim())
                .slug(slug)
                .description(request.description())
                .parent(parent)
                .path(buildPath(parent, slug))
                .depth(parent == null ? 0 : parent.getDepth() + 1)
                .displayOrder(request.displayOrder() != null ? request.displayOrder() : 0)
                .active(request.active() == null || request.active())
                .imageUrl(resolveImageUrl(request.imageUrl(), slug))
                .build();
        return toDto(categoryRepository.save(category));
    }

    @Caching(evict = {
            @CacheEvict(value = ProductCacheNames.CATEGORY_TREE, allEntries = true),
            @CacheEvict(value = ProductCacheNames.PRODUCT_BY_ID, allEntries = true)
    })
    public CategoryDto update(UUID id, UpsertCategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));

        Category parent = resolveParent(request.parentId());
        validateParentNotDescendant(id, parent);

        String slug = resolveSlug(request.name(), request.slug(), parent, id);
        category.setName(request.name().trim());
        category.setSlug(slug);
        category.setDescription(request.description());
        category.setParent(parent);
        category.setPath(buildPath(parent, slug));
        category.setDepth(parent == null ? 0 : parent.getDepth() + 1);
        if (request.displayOrder() != null) {
            category.setDisplayOrder(request.displayOrder());
        }
        if (request.active() != null) {
            category.setActive(request.active());
        }
        if (request.imageUrl() != null) {
            category.setImageUrl(request.imageUrl().isBlank() ? CategoryImages.coverForSlug(slug) : request.imageUrl().trim());
        }
        categoryRepository.save(category);
        refreshDescendantPaths(category);
        return toDto(category);
    }

    @Caching(evict = {
            @CacheEvict(value = ProductCacheNames.CATEGORY_TREE, allEntries = true),
            @CacheEvict(value = ProductCacheNames.PRODUCT_BY_ID, allEntries = true)
    })
    public void deactivate(UUID id) {
        String path = categoryRepository.findPathById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));
        int updated = categoryRepository.softDeleteSubtree(path, path + "/%", Instant.now());
        if (updated == 0) {
            throw new ResourceNotFoundException("Category not found: " + id);
        }
    }

    private void refreshDescendantPaths(Category parent) {
        for (Category child : categoryRepository.findByParentId(parent.getId())) {
            child.setPath(buildPath(parent, child.getSlug()));
            child.setDepth(parent.getDepth() + 1);
            categoryRepository.save(child);
            refreshDescendantPaths(child);
        }
    }

    private void validateParentNotDescendant(UUID categoryId, Category candidateParent) {
        if (candidateParent == null) {
            return;
        }
        if (candidateParent.getId().equals(categoryId)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Category cannot be its own parent");
        }
        Category current = candidateParent;
        while (current != null) {
            if (current.getId().equals(categoryId)) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                        "Category cannot be parented under its own descendant");
            }
            current = current.getParent();
        }
    }

    private Category resolveParent(UUID parentId) {
        if (parentId == null) {
            return null;
        }
        return categoryRepository.findById(parentId)
                .orElseThrow(() -> new ResourceNotFoundException("Parent category not found: " + parentId));
    }

    private String resolveSlug(String name, String requestedSlug, Category parent, UUID excludeId) {
        String slug = requestedSlug != null && !requestedSlug.isBlank()
                ? SlugUtils.toSlug(requestedSlug)
                : SlugUtils.toSlug(name);
        if (slug.isBlank()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Category slug is required");
        }
        UUID parentId = parent != null ? parent.getId() : null;
        boolean exists = slugExists(parentId, slug, excludeId);
        if (exists) {
            throw new BusinessException(ErrorCode.CONFLICT,
                    "Category slug already exists under this parent: " + slug);
        }
        return slug;
    }

    private boolean slugExists(UUID parentId, String slug, UUID excludeId) {
        if (parentId == null) {
            return excludeId == null
                    ? categoryRepository.existsBySlugAndParentIsNull(slug)
                    : categoryRepository.existsBySlugAndParentIsNullAndIdNot(slug, excludeId);
        }
        return excludeId == null
                ? categoryRepository.existsBySlugAndParentId(slug, parentId)
                : categoryRepository.existsBySlugAndParentIdAndIdNot(slug, parentId, excludeId);
    }

    private static String buildPath(Category parent, String slug) {
        return parent == null ? "/" + slug : parent.getPath() + "/" + slug;
    }

    private CategoryDto toDto(Category category) {
        return new CategoryDto(
                category.getId(),
                category.getName(),
                category.getSlug(),
                category.getDescription(),
                category.getDisplayOrder(),
                category.getParent() != null ? category.getParent().getId() : null,
                category.getImageUrl()
        );
    }

    private static String resolveImageUrl(String requested, String slug) {
        if (requested != null && !requested.isBlank()) {
            return requested.trim();
        }
        return CategoryImages.coverForSlug(slug);
    }
}
