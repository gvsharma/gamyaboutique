package com.gamyacouture.auth.application;

import com.gamyacouture.auth.domain.UserAccount;
import com.gamyacouture.auth.infrastructure.UserAccountJpaRepository;
import com.gamyacouture.shared.exception.BusinessException;
import com.gamyacouture.shared.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AccountLockService {

    private static final int MAX_FAILED = 5;
    private static final long LOCK_MINUTES = 15;

    private final UserAccountJpaRepository userRepository;

    public void ensureNotLocked(UserAccount user) {
        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(Instant.now())) {
            throw new BusinessException(ErrorCode.TOO_MANY_REQUESTS, "Account temporarily locked. Try again later.");
        }
    }

    @Transactional
    public void recordFailedLogin(UserAccount user) {
        int attempts = user.getFailedLoginAttempts() + 1;
        user.setFailedLoginAttempts(attempts);
        if (attempts >= MAX_FAILED) {
            user.setLockedUntil(Instant.now().plusSeconds(LOCK_MINUTES * 60));
        }
        userRepository.save(user);
    }

    @Transactional
    public void resetFailedLogin(UserAccount user) {
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);
    }
}
