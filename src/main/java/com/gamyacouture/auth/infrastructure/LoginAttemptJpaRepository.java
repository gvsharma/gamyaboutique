package com.gamyacouture.auth.infrastructure;

import com.gamyacouture.auth.domain.LoginAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.UUID;

public interface LoginAttemptJpaRepository extends JpaRepository<LoginAttempt, UUID> {

    long countByIdentifierAndSuccessFalseAndCreatedAtAfter(String identifier, Instant since);
}
