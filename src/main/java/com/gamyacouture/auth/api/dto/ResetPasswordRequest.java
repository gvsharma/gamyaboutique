package com.gamyacouture.auth.api.dto;

import com.gamyacouture.shared.validation.ValidPassword;
import jakarta.validation.constraints.NotBlank;

public record ResetPasswordRequest(
        String token,
        String otp,
        String identifier,
        @NotBlank @ValidPassword String newPassword
) {
}
