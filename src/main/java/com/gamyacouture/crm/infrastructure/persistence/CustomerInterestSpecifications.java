package com.gamyacouture.crm.infrastructure.persistence;

import com.gamyacouture.crm.api.dto.InterestListFilter;
import com.gamyacouture.crm.domain.CustomerInterest;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public final class CustomerInterestSpecifications {

    private CustomerInterestSpecifications() {
    }

    public static Specification<CustomerInterest> fromFilter(InterestListFilter filter) {
        return (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();

            if (filter == null) {
                return cb.conjunction();
            }

            if (filter.fromDate() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), filter.fromDate()));
            }
            if (filter.toDate() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), filter.toDate()));
            }
            if (filter.status() != null) {
                predicates.add(cb.equal(root.get("status"), filter.status()));
            }
            if (filter.productId() != null) {
                predicates.add(cb.equal(root.get("product").get("id"), filter.productId()));
            }
            if (filter.phone() != null && !filter.phone().isBlank()) {
                String pattern = "%" + filter.phone().trim() + "%";
                predicates.add(cb.like(root.get("phone"), pattern));
            }

            return predicates.isEmpty()
                    ? cb.conjunction()
                    : cb.and(predicates.toArray(jakarta.persistence.criteria.Predicate[]::new));
        };
    }
}
