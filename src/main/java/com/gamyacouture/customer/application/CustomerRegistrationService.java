package com.gamyacouture.customer.application;

import com.gamyacouture.auth.domain.UserAccount;
import com.gamyacouture.auth.infrastructure.UserAccountJpaRepository;
import com.gamyacouture.customer.api.CustomerRegistrationApi;
import com.gamyacouture.customer.domain.Customer;
import com.gamyacouture.customer.infrastructure.CustomerJpaRepository;
import com.gamyacouture.shared.exception.BusinessException;
import com.gamyacouture.shared.exception.ErrorCode;
import com.gamyacouture.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomerRegistrationService implements CustomerRegistrationApi {

    private final CustomerJpaRepository customerRepository;
    private final UserAccountJpaRepository userRepository;

    @Override
    @Transactional
    public UUID registerForUser(UUID userId, String email, String firstName, String lastName, String phone) {
        if (customerRepository.existsByEmailIgnoreCase(email)) {
            throw new BusinessException(ErrorCode.CONFLICT, "Customer profile already exists for this email");
        }
        UserAccount user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        UUID customerId = UUID.randomUUID();
        Customer customer = Customer.builder()
                .id(customerId)
                .user(user)
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
