package com.gamyacouture.crm.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

@Schema(description = "Customer product interest submission")
public record CreateInterestRequest(
        @NotNull
        @Schema(description = "Product UUID", example = "550e8400-e29b-41d4-a716-446655440000")
        UUID productId,

        @NotBlank
        @Size(max = 200)
        @Schema(description = "Customer display name", example = "Priya Sharma")
        String customerName,

        @NotBlank
        @Size(max = 30)
        @Schema(description = "Contact phone", example = "+919876543210")
        String phone,

        @Size(max = 30)
        @Schema(description = "WhatsApp number if different from phone")
        String whatsapp,

        @Size(max = 50)
        @Schema(description = "Preferred size", example = "M")
        String size,

        @Size(max = 100)
        @Schema(description = "Preferred color", example = "Maroon")
        String color,

        @Size(max = 2000)
        @Schema(description = "Optional message from the customer")
        String message
) {
}
