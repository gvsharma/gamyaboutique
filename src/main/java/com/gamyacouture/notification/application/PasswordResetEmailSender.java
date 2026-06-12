package com.gamyacouture.notification.application;

import com.gamyacouture.shared.config.MailProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Sends password-reset emails via SMTP (Gmail, SendGrid free tier, etc.).
 * When {@code app.mail.enabled=false}, logs a warning — no extra AWS cost.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetEmailSender {

    private final MailProperties mailProperties;
    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    public void sendResetLink(String toEmail, String rawToken) {
        if (!mailProperties.enabled()) {
            log.warn("Mail disabled (app.mail.enabled=false) — password reset not sent to {}", maskEmail(toEmail));
            return;
        }
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            log.error("JavaMailSender not configured — set spring.mail.host and credentials");
            return;
        }

        String resetUrl = mailProperties.frontendUrl().replaceAll("/$", "")
                + "/reset-password?token=" + rawToken;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(mailProperties.from());
        message.setTo(toEmail);
        message.setSubject("Reset your Gamya Couture password");
        message.setText("""
                Hello,

                We received a request to reset your password.

                Open this link within 60 minutes:
                %s

                If you did not request this, you can ignore this email.

                — Gamya Couture
                """.formatted(resetUrl));

        try {
            mailSender.send(message);
            log.info("Password reset email sent to {}", maskEmail(toEmail));
        } catch (Exception ex) {
            log.error("Failed to send password reset email to {}", maskEmail(toEmail), ex);
        }
    }

    private static String maskEmail(String email) {
        if (email == null || !email.contains("@")) {
            return "***";
        }
        int at = email.indexOf('@');
        return email.charAt(0) + "***" + email.substring(at);
    }
}
