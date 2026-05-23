package com.gamyacouture.customer.application;

import com.gamyacouture.customer.api.CustomerRegistrationApi;
import com.gamyacouture.customer.domain.Customer;
import com.gamyacouture.customer.infrastructure.CustomerJpaRepository;
import com.gamyacouture.shared.exception.BusinessException;
import com.gamyacouture.shared.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomerRegistrationService implements CustomerRegistrationApi {

    private final CustomerJpaRepository customerRepository;

    @Override
    @Transactional
    public UUID registerForUser(UUID userId, String email, String firstName, String lastName, String phone) {
        if (customerRepository.existsByEmailIgnoreCase(email)) {
            throw new BusinessException(ErrorCode.CONFLICT, "Customer profile already exists for this email");
        }
        UUID customerId = UUID.randomUUID();
        Customer customer = Customer.builder()
                .id(customerId)
                .userId(userId)
                .email(email.trim().toLowerCase())
                .firstName(firstName.trim())
                .lastName(lastName.trim())
                .phone(blankToNull(phone))
                .build();
        customerRepository.save(customer);
        return customerId;
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
