package com.gamyacouture.crm.application;

import com.gamyacouture.crm.api.dto.CreateInterestRequest;
import com.gamyacouture.crm.api.dto.CustomerInterestDto;
import com.gamyacouture.crm.api.dto.InterestCreatedResponse;
import com.gamyacouture.crm.api.dto.InterestListFilter;
import com.gamyacouture.crm.api.dto.UpdateInterestStatusRequest;
import com.gamyacouture.crm.domain.CustomerInterest;
import com.gamyacouture.crm.domain.CustomerInterestStatus;
import com.gamyacouture.crm.infrastructure.CustomerInterestJpaRepository;
import com.gamyacouture.crm.infrastructure.mapper.CustomerInterestMapper;
import com.gamyacouture.crm.infrastructure.persistence.CustomerInterestSpecifications;
import com.gamyacouture.customer.domain.Customer;
import com.gamyacouture.customer.infrastructure.CustomerJpaRepository;
import com.gamyacouture.product.api.event.ProductInterestSubmittedEvent;
import com.gamyacouture.product.domain.Product;
import com.gamyacouture.product.domain.ProductStatus;
import com.gamyacouture.product.infrastructure.ProductJpaRepository;
import com.gamyacouture.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomerInterestService {

    private final ProductJpaRepository productRepository;
    private final CustomerInterestJpaRepository interestRepository;
    private final CustomerJpaRepository customerRepository;
    private final CustomerInterestMapper interestMapper;
    private final CustomerInterestAuditService auditService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public InterestCreatedResponse create(CreateInterestRequest request) {
        return createInterest(
                request.productId(),
                request.customerName(),
                null,
                request.phone(),
                request.whatsapp(),
                request.size(),
                request.color(),
                request.message(),
                null);
    }

    @Transactional
    public InterestCreatedResponse createFromLegacyEndpoint(
            UUID productId,
            String customerName,
            String email,
            String phone,
            String message,
            UUID customerId) {
        return createInterest(
                productId,
                customerName,
                email,
                phone,
                null,
                null,
                null,
                message,
                customerId);
    }

    @Transactional(readOnly = true)
    public Page<CustomerInterestDto> list(InterestListFilter filter, Pageable pageable) {
        Specification<CustomerInterest> spec = CustomerInterestSpecifications.fromFilter(filter);
        return interestRepository.findAll(spec, pageable).map(interestMapper::toDto);
    }

    @Transactional
    public CustomerInterestDto updateStatus(UUID id, UpdateInterestStatusRequest request) {
        CustomerInterest interest = findInterest(id);
        CustomerInterestStatus previous = interest.getStatus();
        if (previous != request.status()) {
            interest.setStatus(request.status());
            interestRepository.save(interest);
            auditService.logStatusChange(interest, previous, request.status(), request.note());
        }
        return interestMapper.toDto(interest);
    }

    private InterestCreatedResponse createInterest(
            UUID productId,
            String customerName,
            String email,
            String phone,
            String whatsapp,
            String size,
            String color,
            String message,
            UUID customerId) {
        Product product = productRepository.findByIdAndStatus(productId, ProductStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));

        Customer customer = null;
        if (customerId != null) {
            customer = customerRepository.findById(customerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + customerId));
        }

        UUID interestId = UUID.randomUUID();
        CustomerInterest interest = CustomerInterest.builder()
                .id(interestId)
                .product(product)
                .customer(customer)
                .customerName(customerName.trim())
                .email(blankToNull(email))
                .phone(phone.trim())
                .whatsapp(blankToNull(whatsapp))
                .size(blankToNull(size))
                .color(blankToNull(color))
                .message(blankToNull(message))
                .status(CustomerInterestStatus.NEW)
                .build();
        interestRepository.save(interest);
        auditService.logCreated(interest);

        eventPublisher.publishEvent(new ProductInterestSubmittedEvent(
                interestId,
                product.getId(),
                interest.getCustomerName(),
                interest.getEmail(),
                interest.getPhone(),
                interest.getWhatsapp(),
                interest.getSize(),
                interest.getColor(),
                interest.getMessage(),
                customer != null ? customer.getId() : null));

        return new InterestCreatedResponse(interestId);
    }

    private CustomerInterest findInterest(UUID id) {
        return interestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interest not found: " + id));
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
