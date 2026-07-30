package com.gamyacouture.crm.api.dto;

import com.gamyacouture.crm.domain.LeadSource;
import com.gamyacouture.crm.domain.LeadStatus;

import java.time.Instant;
import java.util.UUID;

public record CrmLeadDto(
        UUID id,
        String name,
        String email,
        String phone,
        LeadSource source,
        LeadStatus status,
        String notes,
        String occasion,
        String budgetBand,
        String timeline,
        String serviceType,
        String stylistNotes,
        UUID productId,
        String productName,
        UUID customerId,
        Instant createdAt,
        Instant updatedAt
) {
}
