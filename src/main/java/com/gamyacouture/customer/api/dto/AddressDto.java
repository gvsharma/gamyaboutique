package com.gamyacouture.customer.api.dto;

import com.gamyacouture.customer.domain.AddressType;

import java.util.UUID;

public record AddressDto(
        UUID id,
        AddressType addressType,
        String line1,
        String line2,
        String city,
        String state,
        String postalCode,
        String country,
        boolean isDefault
) {
}
