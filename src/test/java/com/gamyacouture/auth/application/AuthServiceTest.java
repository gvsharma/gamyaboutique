package com.gamyacouture.auth.application;

import com.gamyacouture.auth.api.dto.ForgotPasswordRequest;
import com.gamyacouture.auth.api.dto.LoginRequest;
import com.gamyacouture.auth.api.dto.RegisterRequest;
import com.gamyacouture.auth.domain.RoleCode;
import com.gamyacouture.auth.domain.UserAccount;
import com.gamyacouture.auth.infrastructure.CustomUserDetailsService;
import com.gamyacouture.auth.infrastructure.RoleJpaRepository;
import com.gamyacouture.auth.infrastructure.UserAccountJpaRepository;
import com.gamyacouture.customer.api.CustomerRegistrationApi;
import com.gamyacouture.shared.config.JwtProperties;
import com.gamyacouture.shared.exception.BusinessException;
import com.gamyacouture.shared.exception.ErrorCode;
import com.gamyacouture.shared.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private AuthenticationManager authenticationManager;
    @Mock private UserAccountJpaRepository userAccountRepository;
    @Mock private RoleJpaRepository roleRepository;
    @Mock private CustomUserDetailsService userDetailsService;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtTokenProvider jwtTokenProvider;
    @Mock private JwtProperties jwtProperties;
    @Mock private CustomerRegistrationApi customerRegistrationApi;
    @Mock private SessionService sessionService;
    @Mock private LoginRateLimiter loginRateLimiter;
    @Mock private AccountLockService accountLockService;
    @Mock private PasswordResetService passwordResetService;

    @InjectMocks
    private AuthService authService;

    @Test
    void login_unknownUser_returnsGenericUnauthorized() {
        when(userDetailsService.findByIdentifier("nobody@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(new LoginRequest("nobody@test.com", "pass", false)))
                .isInstanceOf(BusinessException.class)
                .extracting(ex -> ((BusinessException) ex).getErrorCode())
                .isEqualTo(ErrorCode.UNAUTHORIZED);

        verify(authenticationManager, never()).authenticate(any());
    }

    @Test
    void login_badPassword_returnsGenericUnauthorized() {
        UUID userId = UUID.randomUUID();
        UserAccount user = UserAccount.builder().id(userId).email("a@test.com").enabled(true).build();
        when(userDetailsService.findByIdentifier("a@test.com")).thenReturn(Optional.of(user));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("bad"));

        assertThatThrownBy(() -> authService.login(new LoginRequest("a@test.com", "wrong", false)))
                .isInstanceOf(BusinessException.class);

        verify(accountLockService).recordFailedLogin(user);
    }

    @Test
    void register_duplicateEmail_throwsConflict() {
        RegisterRequest req = new RegisterRequest("taken@test.com", null, "Valid1!pass", "A", "B");
        when(userAccountRepository.existsByEmailIgnoreCase("taken@test.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(req))
                .isInstanceOf(BusinessException.class)
                .extracting(ex -> ((BusinessException) ex).getErrorCode())
                .isEqualTo(ErrorCode.CONFLICT);
    }

    @Test
    void forgotPassword_delegatesToResetService() {
        authService.forgotPassword(new ForgotPasswordRequest("user@test.com"));
        verify(passwordResetService).requestReset("user@test.com");
    }
}
