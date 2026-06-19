package com.gamyacouture.catalog.application;

import com.gamyacouture.catalog.domain.Category;
import com.gamyacouture.catalog.infrastructure.CategoryJpaRepository;
import com.gamyacouture.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class CategorySlugResolver {

    /** Legacy production slugs before V21 girls taxonomy. */
    private static final Map<String, List<String>> SLUG_CANDIDATES = Map.of(
            "girls", List.of("girls", "kids"),
            "girls-kurtas", List.of("girls-kurtas", "kids-ethnic"),
            "girls-lehengas", List.of("girls-lehengas", "kids-ethnic"));

    private final CategoryJpaRepository categoryRepository;

    public Category resolveActiveBySlug(String slug) {
        String normalized = slug.trim().toLowerCase();
        List<String> candidates = SLUG_CANDIDATES.getOrDefault(normalized, List.of(normalized));
        ResourceNotFoundException lastError = null;
        for (String candidate : candidates) {
            try {
                return resolveDirect(candidate);
            } catch (ResourceNotFoundException ex) {
                lastError = ex;
            }
        }
        throw lastError != null ? lastError : new ResourceNotFoundException("Category not found: " + slug);
    }

    private Category resolveDirect(String normalized) {
        List<Category> matches = categoryRepository.findAllBySlugAndActiveTrue(normalized);
        return switch (matches.size()) {
            case 0 -> throw new ResourceNotFoundException("Category not found: " + normalized);
            case 1 -> matches.getFirst();
            default -> matches.stream()
                    .filter(c -> c.getPath() != null && c.getPath().startsWith("/women/"))
                    .findFirst()
                    .or(() -> matches.stream()
                            .filter(c -> c.getPath() != null && c.getPath().startsWith("/girls/"))
                            .findFirst())
                    .orElseGet(() -> matches.stream()
                            .min(Comparator.comparing(Category::getPath))
                            .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + normalized)));
        };
    }
}
