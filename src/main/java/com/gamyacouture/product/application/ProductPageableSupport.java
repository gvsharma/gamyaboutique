package com.gamyacouture.product.application;

import com.gamyacouture.shared.exception.BusinessException;
import com.gamyacouture.shared.exception.ErrorCode;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.Map;
import java.util.Set;

public final class ProductPageableSupport {

    private static final int MAX_PAGE_SIZE = 100;
    private static final Set<String> ALLOWED_SORT = Set.of(
            "name", "price", "compareAtPrice", "createdAt", "updatedAt", "sku");

    private static final Map<String, String> SORT_ALIASES = Map.of("effectivePrice", "price");

    private ProductPageableSupport() {
    }

    public static Pageable sanitize(Pageable pageable) {
        int size = Math.min(Math.max(pageable.getPageSize(), 1), MAX_PAGE_SIZE);
        Sort sort = sanitizeSort(pageable.getSort());
        return PageRequest.of(pageable.getPageNumber(), size, sort);
    }

    private static Sort sanitizeSort(Sort sort) {
        if (sort.isUnsorted()) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }
        Sort.Order[] orders = sort.stream()
                .map(ProductPageableSupport::sanitizeOrder)
                .toArray(Sort.Order[]::new);
        return Sort.by(orders);
    }

    private static Sort.Order sanitizeOrder(Sort.Order order) {
        String property = SORT_ALIASES.getOrDefault(order.getProperty(), order.getProperty());
        if (!ALLOWED_SORT.contains(property)) {
            throw new BusinessException(
                    ErrorCode.VALIDATION_ERROR,
                    "Invalid sort property: " + order.getProperty() + ". Allowed: " + ALLOWED_SORT);
        }
        return new Sort.Order(order.getDirection(), property);
    }
}
