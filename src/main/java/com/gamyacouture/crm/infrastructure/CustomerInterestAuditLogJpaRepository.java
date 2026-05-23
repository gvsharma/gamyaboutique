package com.gamyacouture.crm.infrastructure;

import com.gamyacouture.crm.domain.CustomerInterestAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CustomerInterestAuditLogJpaRepository extends JpaRepository<CustomerInterestAuditLog, UUID> {
}
