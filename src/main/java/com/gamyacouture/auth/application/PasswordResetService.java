package com.gamyacouture.auth.application;

import com.gamyacouture.auth.domain.OtpChannel;
import com.gamyacouture.auth.domain.OtpPurpose;
import com.gamyacouture.auth.domain.OtpVerification;
import com.gamyacouture.auth.domain.PasswordResetToken;
import com.gamyacouture.auth.domain.UserAccount;
import com.gamyacouture.auth.infrastructure.OtpVerificationJpaRepository;
import com.gamyacouture.auth.infrastructure.PasswordResetTokenJpaRepository;
import com.gamyacouture.auth.infrastructure.UserAccountJpaRepository;
import com.gamyacouture.notification.application.NotificationOutboxService;
import com.gamyacouture.notification.application.PasswordResetEmailSender;
import com.gamyacouture.shared.exception.BusinessException;
import com.gamyacouture.shared.exception.ErrorCode;
import com.gamyacouture.shared.util.PhoneNormalizer;
import com.gamyacouture.shared.util.TokenHasher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {

    private static final long RESET_TOKEN_TTL_MINUTES = 60;
    private static final long OTP_TTL_MINUTES = 10;

    private final UserAccountJpaRepository userRepository;
    private final PasswordResetTokenJpaRepository resetTokenRepository;
    private final OtpVerificationJpaRepository otpRepository;
    private final NotificationOutboxService outboxService;
    private final PasswordResetEmailSender passwordResetEmailSender;
    private final SessionService sessionService;
    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public void requestReset(String identifier) {
        Optional<UserAccount> userOpt = findByIdentifier(identifier);
        if (userOpt.isEmpty()) {
            return;
        }
        UserAccount user = userOpt.get();
        if (user.getEmail() != null && !user.getEmail().isBlank()) {
            issueEmailReset(user);
        } else if (user.getPhone() != null) {
            issuePhoneOtp(user);
        }
    }

    @Transactional
    public void resetWithToken(String rawToken, String newPasswordHash, PasswordEncoderDelegate encoder) {
        PasswordResetToken token = resetTokenRepository.findByTokenHashAndUsedAtIsNull(TokenHasher.sha256(rawToken))
                .filter(PasswordResetToken::isValid)
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED, "Invalid or expired reset token"));

        UserAccount user = userRepository.findById(token.getUserId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "User not found"));
        user.setPasswordHash(encoder.encode(newPasswordHash));
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);
        sessionService.revokeAllForUser(user.getId());

        token.setUsedAt(Instant.now());
        resetTokenRepository.save(token);
    }

    @Transactional
    public void resetWithOtp(String identifier, String otp, String newPasswordHash, PasswordEncoderDelegate encoder) {
        String destination = resolveDestination(identifier);
        OtpVerification verification = otpRepository
                .findFirstByDestinationAndPurposeAndVerifiedAtIsNullOrderByCreatedAtDesc(
                        destination, OtpPurpose.PASSWORD_RESET)
                .filter(OtpVerification::isValid)
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED, "Invalid or expired OTP"));

        verification.setAttempts(verification.getAttempts() + 1);
        if (!TokenHasher.sha256(otp).equals(verification.getOtpHash())) {
            otpRepository.save(verification);
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "Invalid OTP");
        }
        verification.setVerifiedAt(Instant.now());
        otpRepository.save(verification);

        UserAccount user = findByIdentifier(identifier)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "User not found"));
        user.setPasswordHash(encoder.encode(newPasswordHash));
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);
        sessionService.revokeAllForUser(user.getId());
    }

    private void issueEmailReset(UserAccount user) {
        String rawToken = UUID.randomUUID().toString();
        resetTokenRepository.save(PasswordResetToken.builder()
                .id(UUID.randomUUID())
                .userId(user.getId())
                .tokenHash(TokenHasher.sha256(rawToken))
                .expiresAt(Instant.now().plusSeconds(RESET_TOKEN_TTL_MINUTES * 60))
                .build());

        passwordResetEmailSender.sendResetLink(user.getEmail(), rawToken);

        // Keep outbox row for audit / future worker fallback
        outboxService.enqueue("PASSWORD_RESET_EMAIL", Map.of(
                "userId", user.getId().toString(),
                "email", user.getEmail(),
                "resetToken", "redacted"));
        log.info("Password reset issued for user {}", user.getId());
    }

    private void issuePhoneOtp(UserAccount user) {
        String otp = String.format("%06d", secureRandom.nextInt(1_000_000));
        otpRepository.save(OtpVerification.builder()
                .id(UUID.randomUUID())
                .channel(OtpChannel.SMS)
                .destination(user.getPhone())
                .purpose(OtpPurpose.PASSWORD_RESET)
                .otpHash(TokenHasher.sha256(otp))
                .expiresAt(Instant.now().plusSeconds(OTP_TTL_MINUTES * 60))
                .build());

        outboxService.enqueue("PASSWORD_RESET_SMS", Map.of(
                "userId", user.getId().toString(),
                "phone", user.getPhone(),
                "otp", "redacted"));
        log.warn("Phone-only reset for user {} — SMS not configured (MVP: use email or contact support)", user.getId());
    }

    private Optional<UserAccount> findByIdentifier(String identifier) {
        if (PhoneNormalizer.looksLikePhone(identifier)) {
            return userRepository.findByPhone(PhoneNormalizer.normalize(identifier));
        }
        return userRepository.findByEmailIgnoreCase(identifier.trim());
    }

    private String resolveDestination(String identifier) {
        if (PhoneNormalizer.looksLikePhone(identifier)) {
            return PhoneNormalizer.normalize(identifier);
        }
        return identifier.trim().toLowerCase();
    }

    @FunctionalInterface
    public interface PasswordEncoderDelegate {
        String encode(String rawPassword);
    }
}
