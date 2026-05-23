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
        UUID productId,
        UUID customerId,
        Instant createdAt,
        Instant updatedAt
) {
}
