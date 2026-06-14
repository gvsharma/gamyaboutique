package com.gamyacouture.admin.application;

import com.gamyacouture.admin.api.dto.AdminCustomerDetailDto;
import com.gamyacouture.admin.api.dto.AdminCustomerSummaryDto;
import com.gamyacouture.cart.infrastructure.CartJpaRepository;
import com.gamyacouture.customer.domain.Customer;
import com.gamyacouture.customer.infrastructure.CustomerJpaRepository;
import com.gamyacouture.shared.exception.ResourceNotFoundException;
import com.gamyacouture.wishlist.infrastructure.WishlistItemJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminCustomerService {

    private final CustomerJpaRepository customerRepository;
    private final CartJpaRepository cartRepository;
    private final WishlistItemJpaRepository wishlistRepository;

    public Page<AdminCustomerSummaryDto> list(Pageable pageable) {
        return customerRepository.findAll(pageable).map(this::toSummary);
    }

    public AdminCustomerDetailDto getById(UUID id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + id));
        UUID userId = customer.getUser() != null ? customer.getUser().getId() : null;
        return new AdminCustomerDetailDto(
                customer.getId(),
                customer.getEmail(),
                customer.getPhone(),
                customer.getFirstName(),
                customer.getLastName(),
                customer.getNotes(),
                userId,
                customer.getCreatedAt(),
                customer.getUpdatedAt(),
                wishlistRepository.countByCustomerIdAndDeletedAtIsNull(id),
                cartRepository.countByCustomerIdAndDeletedAtIsNull(id));
    }

    private AdminCustomerSummaryDto toSummary(Customer customer) {
        UUID userId = customer.getUser() != null ? customer.getUser().getId() : null;
        return new AdminCustomerSummaryDto(
                customer.getId(),
                customer.getEmail(),
                customer.getPhone(),
                customer.getFirstName(),
                customer.getLastName(),
                userId,
                customer.getCreatedAt());
    }
}
