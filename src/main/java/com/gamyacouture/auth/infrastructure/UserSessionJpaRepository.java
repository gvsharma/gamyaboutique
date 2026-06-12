package com.gamyacouture.auth.infrastructure;

import com.gamyacouture.auth.domain.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserSessionJpaRepository extends JpaRepository<UserSession, UUID> {

    Optional<UserSession> findByRefreshTokenHashAndRevokedAtIsNull(String refreshTokenHash);

    List<UserSession> findByUserIdAndRevokedAtIsNull(UUID userId);
}
