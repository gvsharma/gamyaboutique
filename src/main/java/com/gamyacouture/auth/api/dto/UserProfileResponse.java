package com.gamyacouture.auth.api.dto;

import com.gamyacouture.auth.domain.Role;

import java.util.Set;
import java.util.UUID;

public record UserProfileResponse(
        UUID id,
        String email,
        String firstName,
        String lastName,
        Set<Role> roles
) {
}
