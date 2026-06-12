package com.gamyacouture.customer.api.dto;

import java.util.List;
import java.util.UUID;

public record CustomerProfileDto(
        UUID id,
        UUID userId,
        String email,
        String phone,
        String firstName,
        String lastName,
        List<AddressDto> addresses
) {
}
