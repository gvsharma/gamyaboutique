package com.gamyacouture.product.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "product_categories")
@IdClass(ProductCategoryLinkId.class)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductCategoryLink {

    @Id
    @Column(name = "product_id")
    private UUID productId;

    @Id
    @Column(name = "category_id")
    private UUID categoryId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
