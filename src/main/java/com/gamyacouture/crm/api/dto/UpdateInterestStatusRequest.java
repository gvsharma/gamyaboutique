package com.gamyacouture.crm.api.dto;

import com.gamyacouture.crm.domain.CustomerInterestStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Schema(description = "Update interest workflow status")
public record UpdateInterestStatusRequest(
        @NotNull
        @Schema(description = "New workflow status")
        CustomerInterestStatus status,

        @Size(max = 1000)
        @Schema(description = "Optional note stored in the audit log")
        String note
) {
}
