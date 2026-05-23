package com.gamyacouture.crm.api.dto;

import com.gamyacouture.crm.domain.LeadStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateLeadStatusRequest(
        @NotNull LeadStatus status,
        String notes
) {
}
