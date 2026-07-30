package com.gamyacouture.crm.api.dto;

import com.gamyacouture.crm.domain.LeadSource;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateLeadRequest(
        @NotBlank @Size(max = 200) String name,
        @NotBlank @Email @Size(max = 255) String email,
        @Size(max = 30) String phone,
        LeadSource source,
        String notes,
        @Size(max = 120) String occasion,
        @Size(max = 50) String budgetBand,
        @Size(max = 100) String timeline,
        @Size(max = 100) String serviceType,
        UUID productId,
        UUID customerId
) {
}
