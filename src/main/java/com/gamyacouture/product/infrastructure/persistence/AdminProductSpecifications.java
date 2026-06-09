package com.gamyacouture.product.infrastructure.persistence;

import com.gamyacouture.product.api.dto.AdminProductListFilter;
import com.gamyacouture.product.domain.Product;
import com.gamyacouture.product.domain.ProductStatus;
import org.springframework.data.jpa.domain.Specification;

public final class AdminProductSpecifications {

    private AdminProductSpecifications() {
    }

    public static Specification<Product> fromFilter(AdminProductListFilter filter) {
        return (root, query, cb) -> {
            if (query != null && Product.class.equals(query.getResultType())) {
                query.distinct(true);
            }

            var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();

            if (filter != null && filter.status() != null) {
                predicates.add(cb.equal(root.get("status"), filter.status()));
            }

            if (filter != null && filter.search() != null && !filter.search().isBlank()) {
                String pattern = "%" + filter.search().trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern),
                        cb.like(cb.lower(root.get("sku")), pattern),
                        cb.like(cb.lower(root.get("description")), pattern)));
            }

            return predicates.isEmpty()
                    ? cb.conjunction()
                    : cb.and(predicates.toArray(jakarta.persistence.criteria.Predicate[]::new));
        };
    }

    public static Specification<Product> withStatus(ProductStatus status) {
        return (root, query, cb) -> status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }
}
