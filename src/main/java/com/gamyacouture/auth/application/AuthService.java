package com.gamyacouture.auth.application;

import com.gamyacouture.auth.api.dto.LoginRequest;
import com.gamyacouture.auth.api.dto.RegisterRequest;
import com.gamyacouture.auth.api.dto.TokenResponse;
import com.gamyacouture.auth.api.dto.UserProfileResponse;
import com.gamyacouture.auth.domain.RoleCode;
import com.gamyacouture.auth.domain.RoleEntity;
import com.gamyacouture.auth.domain.UserAccount;
import com.gamyacouture.auth.infrastructure.CustomUserDetailsService;
import com.gamyacouture.auth.infrastructure.RoleJpaRepository;
import com.gamyacouture.auth.infrastructure.UserAccountJpaRepository;
import com.gamyacouture.customer.api.CustomerRegistrationApi;
import com.gamyacouture.shared.config.JwtProperties;
import com.gamyacouture.shared.exception.BusinessException;
import com.gamyacouture.shared.exception.ErrorCode;
import com.gamyacouture.shared.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserAccountJpaRepository userAccountRepository;
    private final RoleJpaRepository roleRepository;
    private final CustomUserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final JwtProperties jwtProperties;
    private final CustomerRegistrationApi customerRegistrationApi;

    public TokenResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        UserAccount user = userDetailsService.loadAccountByEmail(request.email());
        return buildTokenResponse(user);
    }

    @Transactional
    public TokenResponse register(RegisterRequest request) {
        if (userAccountRepository.existsByEmailIgnoreCase(request.email())) {
            throw new BusinessException(ErrorCode.CONFLICT, "Email is already registered");
        }

        UUID userId = UUID.randomUUID();
        UserAccount user = UserAccount.builder()
                .id(userId)
                .email(request.email().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.password()))
                .firstName(request.firstName().trim())
                .lastName(request.lastName().trim())
                .enabled(true)
                .roles(Set.of(roleRepository.findByCode(RoleCode.CUSTOMER)
                        .orElseThrow(() -> new BusinessException(ErrorCode.INTERNAL_ERROR, "Customer role missing"))))
                .build();
        userAccountRepository.save(user);

        customerRegistrationApi.registerForUser(
                userId,
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                null);

        return buildTokenResponse(user);
    }

    public UserProfileResponse getCurrentUser() {
        UserAccount user = resolveCurrentAccount();
        return new UserProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRoles().stream().map(r -> r.getCode().name()).toList());
    }

    private UserAccount resolveCurrentAccount() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof UserDetails principal)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "Not authenticated");
        }
        return userAccountRepository.findById(UUID.fromString(principal.getUsername()))
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "User not found"));
    }

    private TokenResponse buildTokenResponse(UserAccount user) {
        return new TokenResponse(
                jwtTokenProvider.generateAccessToken(user),
                "Bearer",
                jwtProperties.accessTokenExpirationMs());
    }
}
