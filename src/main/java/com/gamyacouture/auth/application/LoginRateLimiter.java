package com.gamyacouture.auth.application;

import com.gamyacouture.auth.domain.LoginAttempt;
import com.gamyacouture.auth.infrastructure.LoginAttemptJpaRepository;
import com.gamyacouture.shared.exception.BusinessException;
import com.gamyacouture.shared.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
public class LoginRateLimiter {

    private static final int MAX_ATTEMPTS_PER_IDENTIFIER = 5;
    private static final int MAX_ATTEMPTS_PER_IP = 20;
    private static final long WINDOW_MS = 15 * 60 * 1000L;

    private final LoginAttemptJpaRepository loginAttemptRepository;
    private final ConcurrentHashMap<String, WindowCounter> ipCounters = new ConcurrentHashMap<>();

    public void checkAllowed(String identifier, String ipAddress) {
        Instant since = Instant.now().minusMillis(WINDOW_MS);
        long failedByIdentifier = loginAttemptRepository.countByIdentifierAndSuccessFalseAndCreatedAtAfter(
                identifier.toLowerCase(), since);
        if (failedByIdentifier >= MAX_ATTEMPTS_PER_IDENTIFIER) {
            throw new BusinessException(ErrorCode.TOO_MANY_REQUESTS, "Too many login attempts. Try again later.");
        }
        if (ipAddress != null) {
            WindowCounter counter = ipCounters.computeIfAbsent(ipAddress, k -> new WindowCounter());
            if (counter.isExceeded(MAX_ATTEMPTS_PER_IP, WINDOW_MS)) {
                throw new BusinessException(ErrorCode.TOO_MANY_REQUESTS, "Too many requests from this IP.");
            }
        }
    }

    @Transactional
    public void recordAttempt(String identifier, String ipAddress, boolean success) {
        loginAttemptRepository.save(LoginAttempt.builder()
                .id(UUID.randomUUID())
                .identifier(identifier.toLowerCase())
                .ipAddress(ipAddress)
                .success(success)
                .build());
        if (!success && ipAddress != null) {
            ipCounters.computeIfAbsent(ipAddress, k -> new WindowCounter()).increment();
        }
    }

    private static final class WindowCounter {
        private final AtomicInteger count = new AtomicInteger();
        private volatile long windowStart = System.currentTimeMillis();

        void increment() {
            resetIfExpired();
            count.incrementAndGet();
        }

        boolean isExceeded(int max, long windowMs) {
            resetIfExpired();
            return count.get() >= max;
        }

        private void resetIfExpired() {
            long now = System.currentTimeMillis();
            if (now - windowStart > WINDOW_MS) {
                count.set(0);
                windowStart = now;
            }
        }
    }
}
