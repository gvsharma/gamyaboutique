package com.gamyacouture.product.domain;

import com.gamyacouture.shared.domain.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "product_interests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductInterest extends BaseAuditableEntity {

    @Id
    private UUID id;

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Column(name = "customer_id")
    private UUID customerId;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false, length = 30)
    private String phone;

    @Column(columnDefinition = "TEXT")
    private String message;
}
