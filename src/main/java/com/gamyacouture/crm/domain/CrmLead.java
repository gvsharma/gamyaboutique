package com.gamyacouture.crm.domain;

import com.gamyacouture.customer.domain.Customer;
import com.gamyacouture.product.domain.Product;
import com.gamyacouture.shared.domain.BaseSoftDeletableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "crm_leads")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CrmLead extends BaseSoftDeletableEntity {

    @Id
    private UUID id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false)
    private String email;

    @Column(length = 30)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private LeadSource source = LeadSource.WEBSITE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private LeadStatus status = LeadStatus.NEW;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(length = 120)
    private String occasion;

    @Column(name = "budget_band", length = 50)
    private String budgetBand;

    @Column(length = 100)
    private String timeline;

    @Column(name = "service_type", length = 100)
    private String serviceType;

    @Column(name = "stylist_notes", columnDefinition = "TEXT")
    private String stylistNotes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;
}
