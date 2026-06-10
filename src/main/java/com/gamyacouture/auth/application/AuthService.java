package com.gamyacouture.auth.application;

import com.gamyacouture.auth.api.dto.ForgotPasswordRequest;
import com.gamyacouture.auth.api.dto.LoginRequest;
import com.gamyacouture.auth.api.dto.RegisterRequest;
import com.gamyacouture.auth.api.dto.ResetPasswordRequest;
import com.gamyacouture.auth.api.dto.TokenResponse;
import com.gamyacouture.auth.api.dto.UserProfileResponse;
import com.gamyacouture.auth.domain.RoleCode;
import com.gamyacouture.auth.domain.UserAccount;
import com.gamyacouture.auth.infrastructure.CustomUserDetailsService;
import com.gamyacouture.auth.infrastructure.RoleJpaRepository;
import com.gamyacouture.auth.infrastructure.UserAccountJpaRepository;
import com.gamyacouture.customer.api.CustomerRegistrationApi;
import com.gamyacouture.shared.config.JwtProperties;
import com.gamyacouture.shared.exception.BusinessException;
import com.gamyacouture.shared.exception.ErrorCode;
import com.gamyacouture.shared.security.CurrentUserProvider;
import com.gamyacouture.shared.security.JwtTokenProvider;
import com.gamyacouture.shared.util.PhoneNormalizer;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserAccountJpaRepository userAccountRepository;
    private final RoleJpaRepository roleRepository;
    private final CustomUserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final JwtProperties jwtProperties;
    private final CustomerRegistrationApi customerRegistrationApi;
    private final SessionService sessionService;
    private final LoginRateLimiter loginRateLimiter;
    private final AccountLockService accountLockService;
    private final PasswordResetService passwordResetService;
    private final CurrentUserProvider currentUserProvider;

    public TokenResponse login(LoginRequest request) {
        String identifier = request.identifier().trim();
        loginRateLimiter.checkAllowed(identifier, clientIp());

        Optional<UserAccount> userOpt = userDetailsService.findByIdentifier(identifier);
        if (userOpt.isEmpty()) {
            loginRateLimiter.recordAttempt(identifier, clientIp(), false);
            log.warn("Login failed — unknown identifier from {}", clientIp());
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "Invalid credentials");
        }
        UserAccount user = userOpt.get();
        accountLockService.ensureNotLocked(user);

        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                    user.getId().toString(), request.password()));
            accountLockService.resetFailedLogin(user);
            loginRateLimiter.recordAttempt(identifier, clientIp(), true);
            return buildTokenResponse(user, request.rememberMe());
        } catch (BadCredentialsException ex) {
            accountLockService.recordFailedLogin(user);
            loginRateLimiter.recordAttempt(identifier, clientIp(), false);
            log.warn("Login failed — bad password for user {} from {}", user.getId(), clientIp());
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "Invalid credentials");
        }
    }

    @Transactional
    public TokenResponse register(RegisterRequest request) {
        String email = blankToNull(request.email());
        String phone = request.phone() != null ? PhoneNormalizer.normalize(request.phone()) : null;

        if (email == null && phone == null) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Email or phone is required");
        }
        if (email != null && userAccountRepository.existsByEmailIgnoreCase(email)) {
            throw new BusinessException(ErrorCode.CONFLICT, "Email is already registered");
        }
        if (phone != null && userAccountRepository.existsByPhone(phone)) {
            throw new BusinessException(ErrorCode.CONFLICT, "Phone number is already registered");
        }

        UUID userId = UUID.randomUUID();
        UserAccount user = UserAccount.builder()
                .id(userId)
                .email(email != null ? email.toLowerCase() : null)
                .phone(phone)
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
                email,
                user.getFirstName(),
                user.getLastName(),
                phone);

        return buildTokenResponse(user, false);
    }

    public TokenResponse refresh(String rawRefreshToken) {
        SessionService.RotateResult rotated = sessionService.rotateSession(
                rawRefreshToken, userAgent(), clientIp());
        UserAccount user = userDetailsService.requireAccount(rotated.userId());
        if (!user.isEnabled()) {
            sessionService.revokeAllForUser(user.getId());
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "Invalid refresh token");
        }
        return new TokenResponse(
                jwtTokenProvider.generateAccessToken(user),
                rotated.tokens().refreshToken(),
                "Bearer",
                jwtProperties.accessTokenExpirationMs(),
                rotated.tokens().refreshExpiresInMs());
    }

    public void logout(String refreshToken) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            sessionService.revokeByRefreshToken(refreshToken);
        }
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        loginRateLimiter.checkAllowed(request.identifier(), clientIp());
        passwordResetService.requestReset(request.identifier().trim());
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        loginRateLimiter.checkAllowed(
                request.identifier() != null ? request.identifier() : "reset-token",
                clientIp());
        if (request.token() != null && !request.token().isBlank()) {
            passwordResetService.resetWithToken(request.token(), request.newPassword(), passwordEncoder::encode);
            return;
        }
        if (request.otp() != null && request.identifier() != null) {
            passwordResetService.resetWithOtp(
                    request.identifier(), request.otp(), request.newPassword(), passwordEncoder::encode);
            return;
        }
        throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Provide reset token or OTP with identifier");
    }

    public UserProfileResponse getCurrentUser() {
        UserAccount user = currentUserProvider.getCurrentAccount();
        return toProfile(user);
    }

    private TokenResponse buildTokenResponse(UserAccount user, boolean rememberMe) {
        SessionService.SessionTokens session = sessionService.createSession(
                user, rememberMe, userAgent(), clientIp());
        return new TokenResponse(
                jwtTokenProvider.generateAccessToken(user),
                session.refreshToken(),
                "Bearer",
                jwtProperties.accessTokenExpirationMs(),
                session.refreshExpiresInMs());
    }

    private UserProfileResponse toProfile(UserAccount user) {
        return new UserProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getPhone(),
                user.getFirstName(),
                user.getLastName(),
                user.getRoles().stream().map(r -> r.getCode().name()).toList());
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private static String clientIp() {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs == null) {
            return null;
        }
        HttpServletRequest request = attrs.getRequest();
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private static String userAgent() {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs == null) {
            return null;
        }
        return attrs.getRequest().getHeader("User-Agent");
    }
}
