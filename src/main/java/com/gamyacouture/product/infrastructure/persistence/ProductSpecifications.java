package com.gamyacouture.product.infrastructure.persistence;

import com.gamyacouture.catalog.domain.Fabric;
import com.gamyacouture.catalog.domain.Offer;
import com.gamyacouture.catalog.domain.Print;
import com.gamyacouture.catalog.domain.Tag;
import com.gamyacouture.product.domain.Product;
import com.gamyacouture.product.domain.ProductCategoryLink;
import com.gamyacouture.product.domain.ProductStatus;
import com.gamyacouture.product.domain.repository.ProductFilter;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public final class ProductSpecifications {

    private ProductSpecifications() {
    }

    public static Specification<Product> fromFilter(ProductFilter filter) {
        return (root, query, cb) -> {
            if (query != null && Product.class.equals(query.getResultType())) {
                query.distinct(true);
            }

            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("status"), ProductStatus.ACTIVE));

            if (filter.hasSearch()) {
                String pattern = "%" + filter.search().trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern),
                        cb.like(cb.lower(root.get("sku")), pattern),
                        cb.like(cb.lower(root.get("description")), pattern)));
            }

            if (filter.categoryIdsInSubtree() != null && !filter.categoryIdsInSubtree().isEmpty()) {
                var subquery = query.subquery(UUID.class);
                var linkRoot = subquery.from(ProductCategoryLink.class);
                subquery.select(linkRoot.get("productId"))
                        .where(linkRoot.get("categoryId").in(filter.categoryIdsInSubtree()));
                predicates.add(root.get("id").in(subquery));
            }

            if (filter.fabricId() != null) {
                predicates.add(cb.equal(root.get("fabric").get("id"), filter.fabricId()));
            } else if (filter.fabricSlug() != null && !filter.fabricSlug().isBlank()) {
                Join<Product, Fabric> fabricJoin = root.join("fabric", JoinType.INNER);
                predicates.add(cb.equal(cb.lower(fabricJoin.get("slug")), filter.fabricSlug().trim().toLowerCase()));
                predicates.add(cb.isTrue(fabricJoin.get("active")));
            }

            if (filter.printId() != null) {
                predicates.add(cb.equal(root.get("print").get("id"), filter.printId()));
            } else if (filter.printSlug() != null && !filter.printSlug().isBlank()) {
                Join<Product, Print> printJoin = root.join("print", JoinType.INNER);
                predicates.add(cb.equal(cb.lower(printJoin.get("slug")), filter.printSlug().trim().toLowerCase()));
                predicates.add(cb.isTrue(printJoin.get("active")));
            }

            if (filter.tagSlugs() != null && !filter.tagSlugs().isEmpty()) {
                Join<Product, Tag> tagJoin = root.join("tags", JoinType.INNER);
                predicates.add(tagJoin.get("slug").in(filter.tagSlugs()));
            }

            Expression<BigDecimal> customerPrice = customerFacingPrice(root, cb);
            if (filter.minPrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(customerPrice, filter.minPrice()));
            }
            if (filter.maxPrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(customerPrice, filter.maxPrice()));
            }

            if (Boolean.TRUE.equals(filter.onOffer())) {
                predicates.add(cb.or(activeOfferPredicate(root, cb), compareAtOfferPredicate(root, cb)));
            } else if (Boolean.FALSE.equals(filter.onOffer())) {
                predicates.add(cb.and(
                        cb.not(activeOfferPredicate(root, cb)),
                        cb.not(compareAtOfferPredicate(root, cb))));
            }

            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }

    private static Expression<BigDecimal> customerFacingPrice(Root<Product> root, jakarta.persistence.criteria.CriteriaBuilder cb) {
        return cb.coalesce(
                cb.<BigDecimal>selectCase()
                        .when(cb.and(
                                cb.isNotNull(root.get("compareAtPrice")),
                                cb.lessThan(root.get("compareAtPrice"), root.get("price"))),
                                root.get("compareAtPrice"))
                        .otherwise(root.get("price")),
                root.get("price"));
    }

    private static Predicate activeOfferPredicate(Root<Product> root, jakarta.persistence.criteria.CriteriaBuilder cb) {
        Join<Product, Offer> offerJoin = root.join("offer", JoinType.LEFT);
        Instant now = Instant.now();
        return cb.and(
                cb.isNotNull(offerJoin.get("id")),
                cb.isTrue(offerJoin.get("active")),
                cb.or(cb.isNull(offerJoin.get("startsAt")), cb.lessThanOrEqualTo(offerJoin.get("startsAt"), now)),
                cb.or(cb.isNull(offerJoin.get("endsAt")), cb.greaterThanOrEqualTo(offerJoin.get("endsAt"), now)));
    }

    private static Predicate compareAtOfferPredicate(Root<Product> root, jakarta.persistence.criteria.CriteriaBuilder cb) {
        return cb.and(
                cb.isNotNull(root.get("compareAtPrice")),
                cb.lessThan(root.get("compareAtPrice"), root.get("price")));
    }
}
