package com.gamyacouture.auth.api.dto;

import java.util.List;
import java.util.UUID;

public record UserProfileResponse(
        UUID id,
        String email,
        String phone,
        String firstName,
        String lastName,
        List<String> roles
) {
}
