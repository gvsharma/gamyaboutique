package com.gamyacouture.notification.infrastructure;

import com.gamyacouture.notification.domain.NotificationOutbox;
import com.gamyacouture.notification.domain.OutboxStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface NotificationOutboxJpaRepository extends JpaRepository<NotificationOutbox, UUID> {

    List<NotificationOutbox> findByStatusOrderByCreatedAtAsc(OutboxStatus status);
}
