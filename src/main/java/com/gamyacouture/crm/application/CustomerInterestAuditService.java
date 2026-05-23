package com.gamyacouture.crm.application;

import com.gamyacouture.crm.domain.CustomerInterest;
import com.gamyacouture.crm.domain.CustomerInterestAuditAction;
import com.gamyacouture.crm.domain.CustomerInterestAuditLog;
import com.gamyacouture.crm.domain.CustomerInterestStatus;
import com.gamyacouture.crm.infrastructure.CustomerInterestAuditLogJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomerInterestAuditService {

    private final CustomerInterestAuditLogJpaRepository auditLogRepository;
    private final AuditActorResolver auditActorResolver;

    public void logCreated(CustomerInterest interest) {
        save(interest, CustomerInterestAuditAction.CREATED, null, interest.getStatus(), null);
    }

    public void logStatusChange(
            CustomerInterest interest,
            CustomerInterestStatus oldStatus,
            CustomerInterestStatus newStatus,
            String note) {
        save(interest, CustomerInterestAuditAction.STATUS_CHANGED, oldStatus, newStatus, note);
    }

    private void save(
            CustomerInterest interest,
            CustomerInterestAuditAction action,
            CustomerInterestStatus oldStatus,
            CustomerInterestStatus newStatus,
            String details) {
        CustomerInterestAuditLog entry = CustomerInterestAuditLog.builder()
                .id(UUID.randomUUID())
                .interest(interest)
                .action(action)
                .oldStatus(oldStatus)
                .newStatus(newStatus)
                .details(blankToNull(details))
                .performedBy(action == CustomerInterestAuditAction.CREATED
                        ? auditActorResolver.currentActorOrGuest()
                        : auditActorResolver.currentActorOrSystem())
                .createdAt(Instant.now())
                .build();
        auditLogRepository.save(entry);
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
