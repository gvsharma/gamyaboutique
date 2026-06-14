package com.gamyacouture.admin.api.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateUserEnabledRequest(@NotNull Boolean enabled) {
}
