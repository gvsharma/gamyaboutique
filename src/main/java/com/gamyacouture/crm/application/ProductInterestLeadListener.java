package com.gamyacouture.crm.application;

import com.gamyacouture.product.api.event.ProductInterestSubmittedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class ProductInterestLeadListener {

    private final LeadManagementService leadManagementService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onProductInterestSubmitted(ProductInterestSubmittedEvent event) {
        leadManagementService.createOrUpdateFromProductInterest(event);
    }
}
