package com.gamyacouture.admin.application;

import com.gamyacouture.admin.api.dto.AdminUserDetailDto;
import com.gamyacouture.admin.api.dto.AdminUserSummaryDto;
import com.gamyacouture.admin.api.dto.UpdateUserEnabledRequest;
import com.gamyacouture.auth.domain.UserAccount;
import com.gamyacouture.auth.infrastructure.UserAccountJpaRepository;
import com.gamyacouture.cart.infrastructure.CartJpaRepository;
import com.gamyacouture.customer.infrastructure.CustomerJpaRepository;
import com.gamyacouture.shared.exception.ResourceNotFoundException;
import com.gamyacouture.wishlist.infrastructure.WishlistItemJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminUserService {

    private final UserAccountJpaRepository userRepository;
    private final CustomerJpaRepository customerRepository;
    private final CartJpaRepository cartRepository;
    private final WishlistItemJpaRepository wishlistRepository;

    public Page<AdminUserSummaryDto> list(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::toSummary);
    }

    public AdminUserDetailDto getById(UUID id) {
        UserAccount user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        UUID customerId = customerRepository.findByUserId(id).map(c -> c.getId()).orElse(null);
        long cartCount = customerId != null ? cartRepository.countByCustomerIdAndDeletedAtIsNull(customerId) : 0;
        long wishlistCount = customerId != null ? wishlistRepository.countByCustomerIdAndDeletedAtIsNull(customerId) : 0;
        return new AdminUserDetailDto(
                user.getId(),
                user.getEmail(),
                user.getPhone(),
                user.getFirstName(),
                user.getLastName(),
                user.isEnabled(),
                roleNames(user),
                user.getCreatedAt(),
                user.getUpdatedAt(),
                customerId,
                cartCount,
                wishlistCount);
    }

    @Transactional
    public AdminUserSummaryDto updateEnabled(UUID id, UpdateUserEnabledRequest request) {
        UserAccount user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        user.setEnabled(request.enabled());
        return toSummary(user);
    }

    private AdminUserSummaryDto toSummary(UserAccount user) {
        return new AdminUserSummaryDto(
                user.getId(),
                user.getEmail(),
                user.getPhone(),
                user.getFirstName(),
                user.getLastName(),
                user.isEnabled(),
                roleNames(user),
                user.getCreatedAt());
    }

    private static List<String> roleNames(UserAccount user) {
        return user.getRoles().stream()
                .map(role -> role.getCode().name())
                .sorted()
                .toList();
    }
}
