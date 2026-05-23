package com.gamyacouture.product.application;

import com.gamyacouture.crm.application.CustomerInterestService;
import com.gamyacouture.crm.api.dto.InterestCreatedResponse;
import com.gamyacouture.product.api.dto.ProductInterestCreatedResponse;
import com.gamyacouture.product.api.dto.ProductInterestRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductInterestService {

    private final CustomerInterestService customerInterestService;

    @Transactional
    public ProductInterestCreatedResponse submitInterest(UUID productId, ProductInterestRequest request) {
        InterestCreatedResponse created = customerInterestService.createFromLegacyEndpoint(
                productId,
                deriveName(request.email()),
                request.email().trim(),
                request.phone(),
                request.message(),
                request.customerId());
        return new ProductInterestCreatedResponse(created.id());
    }

    private static String deriveName(String email) {
        int at = email.indexOf('@');
        return at > 0 ? email.substring(0, at) : email;
    }
}
