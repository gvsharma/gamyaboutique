package com.gamyacouture.crm.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(description = "Interest submission acknowledgement")
public record InterestCreatedResponse(
        @Schema(description = "Created interest record id")
        UUID id
) {
}
