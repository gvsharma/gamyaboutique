package com.gamyacouture.catalog.application;

import com.gamyacouture.catalog.domain.Category;
import com.gamyacouture.shared.exception.BusinessException;
import com.gamyacouture.shared.exception.ErrorCode;

import java.util.Set;

/** Allowed Women & Girls taxonomy for boutique storefront. */
public final class CategoryTaxonomy {

    private static final Set<String> ROOT_SLUGS = Set.of("women", "girls");
    private static final Set<String> WOMEN_CHILDREN = Set.of("sarees", "kurtas", "lehengas", "blouses");
    private static final Set<String> GIRLS_CHILDREN = Set.of("girls-kurtas", "girls-lehengas");

    private CategoryTaxonomy() {
    }

    public static void validateProductCategory(Category category) {
        if (category == null) {
            return;
        }
        if (category.getParent() == null) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                    "Assign products to a specific type (e.g. Sarees, Kurtas), not the Women or Girls group.");
        }
        String parentSlug = category.getParent().getSlug();
        String slug = category.getSlug();
        if ("women".equals(parentSlug) && WOMEN_CHILDREN.contains(slug)) {
            return;
        }
        if ("girls".equals(parentSlug) && GIRLS_CHILDREN.contains(slug)) {
            return;
        }
        throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                "Category must be under Women (sarees, kurtas, lehengas, blouses) or Girls (girls-kurtas, girls-lehengas).");
    }

    public static void validateAdminCategory(Category category, Category parent) {
        if (parent == null) {
            if (!ROOT_SLUGS.contains(category.getSlug())) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                        "Only Women and Girls root categories are allowed.");
            }
            return;
        }
        String parentSlug = parent.getSlug();
        String slug = category.getSlug();
        if ("women".equals(parentSlug) && WOMEN_CHILDREN.contains(slug)) {
            return;
        }
        if ("girls".equals(parentSlug) && GIRLS_CHILDREN.contains(slug)) {
            return;
        }
        throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                "Child categories must match the Women or Girls taxonomy.");
    }
}
