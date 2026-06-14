package com.gamyacouture.admin.api.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record AdminUserSummaryDto(
        UUID id,
        String email,
        String phone,
        String firstName,
        String lastName,
        boolean enabled,
        List<String> roles,
        Instant createdAt
) {
}
