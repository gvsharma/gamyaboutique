package com.gamyacouture.crm.api.dto;

import com.gamyacouture.crm.domain.CustomerInterestStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.Instant;
import java.util.UUID;

@Schema(description = "Filters for listing customer interests (admin)")
public record InterestListFilter(
        @Schema(description = "Inclusive start of created-at range (ISO-8601 instant)")
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        Instant fromDate,

        @Schema(description = "Inclusive end of created-at range (ISO-8601 instant)")
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        Instant toDate,

        @Schema(description = "Interest workflow status")
        CustomerInterestStatus status,

        @Schema(description = "Filter by product id")
        UUID productId,

        @Schema(description = "Partial or full customer phone match")
        String phone
) {
}
