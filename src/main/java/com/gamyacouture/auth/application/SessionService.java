package com.gamyacouture.auth.application;

import com.gamyacouture.auth.domain.UserAccount;
import com.gamyacouture.auth.domain.UserSession;
import com.gamyacouture.auth.infrastructure.UserSessionJpaRepository;
import com.gamyacouture.shared.config.JwtProperties;
import com.gamyacouture.shared.exception.BusinessException;
import com.gamyacouture.shared.exception.ErrorCode;
import com.gamyacouture.shared.util.TokenHasher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final UserSessionJpaRepository sessionRepository;
    private final JwtProperties jwtProperties;

    @Transactional
    public SessionTokens createSession(UserAccount user, boolean rememberMe, String userAgent, String ipAddress) {
        String rawRefresh = UUID.randomUUID().toString() + UUID.randomUUID();
        long refreshTtl = rememberMe ? jwtProperties.rememberMeExpirationMs() : jwtProperties.refreshTokenExpirationMs();

        UserSession session = UserSession.builder()
                .id(UUID.randomUUID())
                .userId(user.getId())
                .refreshTokenHash(TokenHasher.sha256(rawRefresh))
                .rememberMe(rememberMe)
                .userAgent(truncate(userAgent, 500))
                .ipAddress(ipAddress)
                .expiresAt(Instant.now().plusMillis(refreshTtl))
                .build();
        sessionRepository.save(session);
        return new SessionTokens(rawRefresh, refreshTtl);
    }

    @Transactional
    public RotateResult rotateSession(String rawRefreshToken, String userAgent, String ipAddress) {
        UserSession existing = sessionRepository
                .findByRefreshTokenHashAndRevokedAtIsNull(TokenHasher.sha256(rawRefreshToken))
                .filter(UserSession::isActive)
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED, "Invalid refresh token"));

        existing.setRevokedAt(Instant.now());
        sessionRepository.save(existing);

        UserAccount user = UserAccount.builder().id(existing.getUserId()).build();
        SessionTokens tokens = createSession(user, existing.isRememberMe(), userAgent, ipAddress);
        return new RotateResult(existing.getUserId(), tokens);
    }

    @Transactional
    public void revokeByRefreshToken(String rawRefreshToken) {
        sessionRepository
                .findByRefreshTokenHashAndRevokedAtIsNull(TokenHasher.sha256(rawRefreshToken))
                .ifPresent(session -> {
                    session.setRevokedAt(Instant.now());
                    sessionRepository.save(session);
                });
    }

    @Transactional
    public void revokeAllForUser(UUID userId) {
        Instant now = Instant.now();
        sessionRepository.findByUserIdAndRevokedAtIsNull(userId).forEach(session -> {
            session.setRevokedAt(now);
            sessionRepository.save(session);
        });
    }

    private static String truncate(String value, int max) {
        if (value == null) {
            return null;
        }
        return value.length() <= max ? value : value.substring(0, max);
    }

    public record SessionTokens(String refreshToken, long refreshExpiresInMs) {
    }

    public record RotateResult(UUID userId, SessionTokens tokens) {
    }
}
