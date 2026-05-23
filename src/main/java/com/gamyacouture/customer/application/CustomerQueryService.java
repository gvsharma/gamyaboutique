package com.gamyacouture.customer.application;

import com.gamyacouture.auth.domain.UserAccount;
import com.gamyacouture.auth.infrastructure.UserAccountJpaRepository;
import com.gamyacouture.customer.api.CustomerQueryApi;
import com.gamyacouture.customer.api.dto.CustomerProfileDto;
import com.gamyacouture.customer.domain.Customer;
import com.gamyacouture.customer.infrastructure.CustomerJpaRepository;
import com.gamyacouture.customer.infrastructure.mapper.CustomerMapper;
import com.gamyacouture.shared.exception.BusinessException;
import com.gamyacouture.shared.exception.ErrorCode;
import com.gamyacouture.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CustomerQueryService implements CustomerQueryApi {

    private final CustomerJpaRepository customerRepository;
    private final UserAccountJpaRepository userAccountRepository;
    private final CustomerMapper customerMapper;

    @Override
    public Optional<CustomerProfileDto> findByUserId(UUID userId) {
        return customerRepository.findByUserId(userId).map(customerMapper::toProfileDto);
    }

    @Override
    public CustomerProfileDto getCurrentCustomerProfile() {
        UUID userId = resolveCurrentUserId();
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found"));
        return customerMapper.toProfileDto(customer);
    }

    private UUID resolveCurrentUserId() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof UserDetails principal)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "Not authenticated");
        }
        String username = principal.getUsername();
        try {
            return UUID.fromString(username);
        } catch (IllegalArgumentException ignored) {
            UserAccount account = userAccountRepository.findByEmail(username)
                    .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED, "Not authenticated"));
            return account.getId();
        }
    }
}
