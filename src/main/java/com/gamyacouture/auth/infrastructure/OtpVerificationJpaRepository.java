package com.gamyacouture.auth.infrastructure;

import com.gamyacouture.auth.domain.OtpPurpose;
import com.gamyacouture.auth.domain.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface OtpVerificationJpaRepository extends JpaRepository<OtpVerification, UUID> {

    Optional<OtpVerification> findFirstByDestinationAndPurposeAndVerifiedAtIsNullOrderByCreatedAtDesc(
            String destination, OtpPurpose purpose);
}
