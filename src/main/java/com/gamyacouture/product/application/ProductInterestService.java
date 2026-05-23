package com.gamyacouture.product.application;

import com.gamyacouture.crm.domain.CustomerInterest;
import com.gamyacouture.crm.domain.CustomerInterestStatus;
import com.gamyacouture.crm.infrastructure.CustomerInterestJpaRepository;
import com.gamyacouture.customer.domain.Customer;
import com.gamyacouture.customer.infrastructure.CustomerJpaRepository;
import com.gamyacouture.product.api.dto.ProductInterestCreatedResponse;
import com.gamyacouture.product.api.dto.ProductInterestRequest;
import com.gamyacouture.product.api.event.ProductInterestSubmittedEvent;
import com.gamyacouture.product.domain.Product;
import com.gamyacouture.product.domain.ProductStatus;
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
    private final CustomerInterestJpaRepository interestRepository;
    private final CustomerJpaRepository customerRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public ProductInterestCreatedResponse submitInterest(UUID productId, ProductInterestRequest request) {
        Product product = productRepository.findByIdAndStatus(productId, ProductStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));

        Customer customer = null;
        if (request.customerId() != null) {
            customer = customerRepository.findById(request.customerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + request.customerId()));
        }

        UUID interestId = UUID.randomUUID();
        CustomerInterest interest = CustomerInterest.builder()
                .id(interestId)
                .product(product)
                .customer(customer)
                .email(request.email().trim())
                .phone(request.phone().trim())
                .message(blankToNull(request.message()))
                .status(CustomerInterestStatus.NEW)
                .build();
        interestRepository.save(interest);

        eventPublisher.publishEvent(new ProductInterestSubmittedEvent(
                interestId,
                product.getId(),
                interest.getEmail(),
                interest.getPhone(),
                interest.getMessage(),
                customer != null ? customer.getId() : null
        ));

        return new ProductInterestCreatedResponse(interestId);
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
