package com.gamyacouture.auth.api.web;

import com.gamyacouture.auth.api.dto.ForgotPasswordRequest;
import com.gamyacouture.auth.api.dto.LoginRequest;
import com.gamyacouture.auth.api.dto.LogoutRequest;
import com.gamyacouture.auth.api.dto.RefreshTokenRequest;
import com.gamyacouture.auth.api.dto.RegisterRequest;
import com.gamyacouture.auth.api.dto.ResetPasswordRequest;
import com.gamyacouture.auth.api.dto.TokenResponse;
import com.gamyacouture.auth.api.dto.UserProfileResponse;
import com.gamyacouture.auth.application.AuthService;
import com.gamyacouture.shared.web.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static com.gamyacouture.shared.config.OpenApiConfig.BEARER_AUTH;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Auth")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Authenticate with email or phone and obtain tokens")
    public ApiResponse<TokenResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.ok(authService.login(request));
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new customer account")
    public ApiResponse<TokenResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.ok(authService.register(request));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Rotate refresh token and obtain a new access token")
    public ApiResponse<TokenResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ApiResponse.ok(authService.refresh(request.refreshToken()));
    }

    @PostMapping("/logout")
    @Operation(summary = "Revoke refresh token session")
    @SecurityRequirement(name = BEARER_AUTH)
    public ApiResponse<Void> logout(@RequestBody(required = false) LogoutRequest request) {
        String refresh = request != null ? request.refreshToken() : null;
        authService.logout(refresh);
        return ApiResponse.ok(null, "Logged out");
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request password reset via email link or phone OTP")
    public ApiResponse<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ApiResponse.ok(null, "If an account exists, reset instructions have been sent");
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password using token or OTP")
    public ApiResponse<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ApiResponse.ok(null, "Password updated");
    }

    @GetMapping("/me")
    @Operation(summary = "Get the authenticated user profile")
    @SecurityRequirement(name = BEARER_AUTH)
    public ApiResponse<UserProfileResponse> me() {
        return ApiResponse.ok(authService.getCurrentUser());
    }
}
