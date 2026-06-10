package com.gamyacouture.customer.api.dto;

import com.gamyacouture.customer.domain.AddressType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpsertAddressRequest(
        AddressType addressType,
        @NotBlank @Size(max = 300) String line1,
        @Size(max = 300) String line2,
        @NotBlank @Size(max = 100) String city,
        @Size(max = 100) String state,
        @Size(max = 20) String postalCode,
        @Size(max = 2) String country,
        Boolean isDefault
) {
}
