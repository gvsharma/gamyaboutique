package com.gamyacouture.shared.security;

import com.gamyacouture.auth.domain.UserAccount;
import com.gamyacouture.auth.infrastructure.UserAccountJpaRepository;
import com.gamyacouture.shared.exception.BusinessException;
import com.gamyacouture.shared.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CurrentUserProvider {

    private final UserAccountJpaRepository userAccountRepository;

    public Optional<UUID> getCurrentUserIdOptional() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof UserDetails principal)) {
            return Optional.empty();
        }
        try {
            return Optional.of(UUID.fromString(principal.getUsername()));
        } catch (IllegalArgumentException ignored) {
            return userAccountRepository.findByEmailIgnoreCase(principal.getUsername())
                    .map(UserAccount::getId);
        }
    }

    public UUID getCurrentUserId() {
        return getCurrentUserIdOptional()
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED, "Not authenticated"));
    }

    public UserAccount getCurrentAccount() {
        UUID userId = getCurrentUserId();
        return userAccountRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "User not found"));
    }
}
