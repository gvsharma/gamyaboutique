package com.gamyacouture.product.application;

import com.gamyacouture.product.api.dto.ProductInterestCreatedResponse;
import com.gamyacouture.product.api.dto.ProductInterestRequest;
import com.gamyacouture.product.api.event.ProductInterestSubmittedEvent;
import com.gamyacouture.product.domain.Product;
import com.gamyacouture.product.domain.ProductInterest;
import com.gamyacouture.product.domain.ProductStatus;
import com.gamyacouture.product.infrastructure.ProductInterestJpaRepository;
import com.gamyacouture.product.infrastructure.ProductJpaRepository;
import com.gamyacouture.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductInterestService {

    private final ProductJpaRepository productRepository;
    private final ProductInterestJpaRepository interestRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public ProductInterestCreatedResponse submitInterest(UUID productId, ProductInterestRequest request) {
        Product product = productRepository.findByIdAndStatus(productId, ProductStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));

        UUID interestId = UUID.randomUUID();
        ProductInterest interest = ProductInterest.builder()
                .id(interestId)
                .productId(product.getId())
                .customerId(request.customerId())
                .email(request.email().trim())
                .phone(request.phone().trim())
                .message(blankToNull(request.message()))
                .build();
        interestRepository.save(interest);

        eventPublisher.publishEvent(new ProductInterestSubmittedEvent(
                interestId,
                product.getId(),
                interest.getEmail(),
                interest.getPhone(),
                interest.getMessage(),
                interest.getCustomerId()
        ));

        return new ProductInterestCreatedResponse(interestId);
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
