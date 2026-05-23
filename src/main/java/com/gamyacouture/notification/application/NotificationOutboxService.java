package com.gamyacouture.notification.application;

import com.gamyacouture.notification.domain.NotificationOutbox;
import com.gamyacouture.notification.domain.OutboxStatus;
import com.gamyacouture.notification.infrastructure.NotificationOutboxJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationOutboxService {

    private final NotificationOutboxJpaRepository outboxRepository;

    @Transactional
    public UUID enqueue(String eventType, Map<String, Object> payload) {
        UUID id = UUID.randomUUID();
        NotificationOutbox entry = NotificationOutbox.builder()
                .id(id)
                .eventType(eventType)
                .payload(payload)
                .status(OutboxStatus.PENDING)
                .build();
        outboxRepository.save(entry);
        return id;
    }
}
