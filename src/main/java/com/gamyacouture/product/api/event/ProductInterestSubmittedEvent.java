package com.gamyacouture.product.api.event;

import java.util.UUID;

public record ProductInterestSubmittedEvent(
        UUID interestId,
        UUID productId,
        String email,
        String phone,
        String message,
        UUID customerId
) {
}
