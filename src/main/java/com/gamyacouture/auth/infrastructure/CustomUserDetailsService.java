package com.gamyacouture.auth.infrastructure;

import com.gamyacouture.auth.domain.Role;
import com.gamyacouture.auth.domain.UserAccount;
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
        return User.builder()
                .username(account.getId().toString())
                .password(account.getPasswordHash())
                .authorities(account.getRoles().stream()
                        .map(Role::getAuthority)
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toSet()))
                .build();
    }

    public UserAccount loadAccountByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    private UserAccount loadAccount(String username) {
        try {
            UUID id = UUID.fromString(username);
            return userRepository.findById(id)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        } catch (IllegalArgumentException ex) {
            return loadAccountByEmail(username);
        }
    }
}
