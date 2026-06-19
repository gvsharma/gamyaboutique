package com.gamyacouture.catalog.application;

import com.gamyacouture.catalog.domain.Category;
import com.gamyacouture.catalog.infrastructure.CategoryJpaRepository;
import com.gamyacouture.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;

@Component
@RequiredArgsConstructor
public class CategorySlugResolver {

    private final CategoryJpaRepository categoryRepository;

    public Category resolveActiveBySlug(String slug) {
        String normalized = slug.trim().toLowerCase();
        List<Category> matches = categoryRepository.findAllBySlugAndActiveTrue(normalized);
        return switch (matches.size()) {
            case 0 -> throw new ResourceNotFoundException("Category not found: " + slug);
            case 1 -> matches.getFirst();
            default -> matches.stream()
                    .filter(c -> c.getPath() != null && c.getPath().startsWith("/women/"))
                    .findFirst()
                    .or(() -> matches.stream()
                            .filter(c -> c.getPath() != null && c.getPath().startsWith("/girls/"))
                            .findFirst())
                    .orElseGet(() -> matches.stream()
                            .min(Comparator.comparing(Category::getPath))
                            .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + slug)));
        };
    }
}
