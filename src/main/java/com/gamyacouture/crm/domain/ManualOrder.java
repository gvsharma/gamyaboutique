package com.gamyacouture.crm.domain;

import com.gamyacouture.customer.domain.Customer;
import com.gamyacouture.shared.domain.BaseSoftDeletableEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "manual_orders")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ManualOrder extends BaseSoftDeletableEntity {

    @Id
    private UUID id;

    @Column(name = "order_number", nullable = false, length = 50)
    private String orderNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private ManualOrderStatus status = ManualOrderStatus.DRAFT;

    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "tax_amount", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal total = BigDecimal.ZERO;

    @Column(nullable = false, length = 3)
    @Builder.Default
    private String currency = "INR";

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "placed_at")
    private Instant placedAt;

    @OneToMany(mappedBy = "manualOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ManualOrderItem> items = new ArrayList<>();
}
