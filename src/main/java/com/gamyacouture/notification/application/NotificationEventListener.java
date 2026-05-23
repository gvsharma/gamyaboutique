package com.gamyacouture.notification.application;

import com.gamyacouture.product.api.event.ProductInterestSubmittedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventListener {

    private static final String EVENT_TYPE = "PRODUCT_INTEREST_SUBMITTED";

    private final NotificationOutboxService outboxService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onProductInterestSubmitted(ProductInterestSubmittedEvent event) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("interestId", event.interestId().toString());
        payload.put("productId", event.productId().toString());
        payload.put("email", event.email());
        payload.put("phone", event.phone());
        if (event.message() != null) {
            payload.put("message", event.message());
        }
        if (event.customerId() != null) {
            payload.put("customerId", event.customerId().toString());
        }

        UUID outboxId = outboxService.enqueue(EVENT_TYPE, payload);
        log.debug("Enqueued notification outbox entry {} for product interest {}", outboxId, event.interestId());
    }
}
