package com.gamyacouture.crm.domain;

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

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "customer_interest_audit_log")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerInterestAuditLog {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "interest_id", nullable = false)
    private CustomerInterest interest;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private CustomerInterestAuditAction action;

    @Enumerated(EnumType.STRING)
    @Column(name = "old_status", length = 30)
    private CustomerInterestStatus oldStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", length = 30)
    private CustomerInterestStatus newStatus;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(name = "performed_by", nullable = false)
    private String performedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
