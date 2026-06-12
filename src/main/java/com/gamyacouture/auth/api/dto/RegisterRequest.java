package com.gamyacouture.auth.api.dto;

import com.gamyacouture.shared.validation.EmailOrPhoneRequired;
import com.gamyacouture.shared.validation.ValidPassword;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@EmailOrPhoneRequired
public record RegisterRequest(
        @Email @Size(max = 255) String email,
        @Size(max = 20) String phone,
        @NotBlank @ValidPassword String password,
        @NotBlank @Size(max = 100) String firstName,
        @NotBlank @Size(max = 100) String lastName
) {
}
