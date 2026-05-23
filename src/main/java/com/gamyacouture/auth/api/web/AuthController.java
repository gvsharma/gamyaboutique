package com.gamyacouture.auth.api.web;

import com.gamyacouture.auth.api.dto.LoginRequest;
import com.gamyacouture.auth.api.dto.RegisterRequest;
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
    @Operation(summary = "Authenticate and obtain a JWT access token")
    public ApiResponse<TokenResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.ok(authService.login(request));
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new customer account")
    public ApiResponse<TokenResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.ok(authService.register(request));
    }

    @GetMapping("/me")
    @Operation(summary = "Get the authenticated user profile")
    @SecurityRequirement(name = BEARER_AUTH)
    public ApiResponse<UserProfileResponse> me() {
        return ApiResponse.ok(authService.getCurrentUser());
    }
}
