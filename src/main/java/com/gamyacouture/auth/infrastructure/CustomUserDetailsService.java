package com.gamyacouture.auth.infrastructure;

import com.gamyacouture.auth.domain.UserAccount;
import com.gamyacouture.shared.exception.BusinessException;
import com.gamyacouture.shared.exception.ErrorCode;
import com.gamyacouture.shared.util.PhoneNormalizer;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserAccountJpaRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserAccount account = loadAccount(username);
        if (!account.isEnabled()) {
            throw new UsernameNotFoundException("User disabled: " + username);
        }
        return toUserDetails(account);
    }

    public UserAccount loadAccountByIdentifier(String identifier) {
        return findByIdentifier(identifier)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    public UserAccount loadAccountByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    private UserAccount loadAccount(String username) {
        return findByIdentifier(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    public java.util.Optional<UserAccount> findByIdentifier(String raw) {
        if (raw == null || raw.isBlank()) {
            return java.util.Optional.empty();
        }
        try {
            UUID id = UUID.fromString(raw);
            return userRepository.findById(id);
        } catch (IllegalArgumentException ignored) {
            if (PhoneNormalizer.looksLikePhone(raw)) {
                return userRepository.findByPhone(PhoneNormalizer.normalize(raw));
            }
            return userRepository.findByEmailIgnoreCase(raw.trim());
        }
    }

    private UserDetails toUserDetails(UserAccount account) {
        return User.builder()
                .username(account.getId().toString())
                .password(account.getPasswordHash())
                .authorities(account.getRoles().stream()
                        .map(role -> role.getCode().getAuthority())
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toSet()))
                .build();
    }

    public UserAccount requireAccount(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "User not found"));
    }
}
