package com.gamyacouture.product.application;

import com.gamyacouture.product.infrastructure.ProductJpaRepository;
import lombok.experimental.UtilityClass;

import java.util.Locale;
import java.util.UUID;

@UtilityClass
public class ProductSkuGenerator {

    public static String generate(ProductJpaRepository productRepository, String name, String categorySlug) {
        String base = buildBase(name, categorySlug);
        String candidate = base;
        int attempt = 0;
        while (productRepository.existsBySku(candidate)) {
            attempt++;
            if (attempt > 99) {
                candidate = base + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase(Locale.ROOT);
                break;
            }
            candidate = base + "-" + attempt;
        }
        return candidate;
    }

    static String buildBase(String name, String categorySlug) {
        String prefix = "GC";
        if (categorySlug != null && !categorySlug.isBlank()) {
            String compact = categorySlug.replace("-", "").toUpperCase(Locale.ROOT);
            prefix = compact.substring(0, Math.min(4, compact.length()));
        }
        String slug = name == null ? "PRODUCT" : name.toUpperCase(Locale.ROOT)
                .replaceAll("[^A-Z0-9]+", "-")
                .replaceAll("^-+|-+$", "");
        if (slug.isBlank()) {
            slug = "PRODUCT";
        }
        if (slug.length() > 24) {
            slug = slug.substring(0, 24);
        }
        return prefix + "-" + slug;
    }
}
