package com.gamyacouture.product.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record ProductInterestRequest(
        @NotBlank @Email String email,
        @NotBlank @Size(max = 30) String phone,
        String message,
        UUID customerId
) {
}
