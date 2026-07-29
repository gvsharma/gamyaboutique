package com.gamyacouture.crm.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateConsultationRequest(
        @NotBlank @Size(max = 200) String name,
        @Email @Size(max = 255) String email,
        @NotBlank @Size(max = 30) String phone,
        @Size(max = 120) String occasion,
        @Size(max = 50) String budgetBand,
        @Size(max = 100) String timeline,
        @Size(max = 100) String serviceType,
        @Size(max = 2000) String message,
        UUID productId) {
}
