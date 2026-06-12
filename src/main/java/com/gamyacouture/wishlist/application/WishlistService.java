package com.gamyacouture.wishlist.application;

import com.gamyacouture.cart.api.dto.AddCartItemRequest;
import com.gamyacouture.cart.application.CartService;
import com.gamyacouture.customer.domain.Customer;
import com.gamyacouture.customer.infrastructure.CustomerJpaRepository;
import com.gamyacouture.product.api.dto.ProductSummaryDto;
import com.gamyacouture.product.domain.Product;
import com.gamyacouture.product.domain.ProductStatus;
import com.gamyacouture.product.infrastructure.ProductJpaRepository;
import com.gamyacouture.product.infrastructure.mapper.ProductMapper;
import com.gamyacouture.shared.exception.BusinessException;
import com.gamyacouture.shared.exception.ErrorCode;
import com.gamyacouture.shared.exception.ResourceNotFoundException;
import com.gamyacouture.shared.security.CurrentUserProvider;
import com.gamyacouture.wishlist.domain.WishlistItem;
import com.gamyacouture.wishlist.infrastructure.WishlistItemJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class WishlistService {

    private final WishlistItemJpaRepository wishlistRepository;
    private final CustomerJpaRepository customerRepository;
    private final ProductJpaRepository productRepository;
    private final ProductMapper productMapper;
    private final CurrentUserProvider currentUserProvider;
    private final CartService cartService;

    @Transactional(readOnly = true)
    public List<ProductSummaryDto> list() {
        UUID customerId = requireCustomerId();
        return wishlistRepository.findByCustomerIdAndDeletedAtIsNullOrderByCreatedAtDesc(customerId).stream()
                .map(item -> productRepository.findById(item.getProductId()).orElse(null))
                .filter(p -> p != null && p.getDeletedAt() == null && p.getStatus() == ProductStatus.ACTIVE)
                .map(productMapper::toSummary)
                .toList();
    }

    public List<ProductSummaryDto> add(UUID productId) {
        UUID customerId = requireCustomerId();
        Product product = productRepository.findById(productId)
                .filter(p -> p.getDeletedAt() == null && p.getStatus() == ProductStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));

        if (!wishlistRepository.existsByCustomerIdAndProductIdAndDeletedAtIsNull(customerId, productId)) {
            wishlistRepository.save(WishlistItem.builder()
                    .id(UUID.randomUUID())
                    .customerId(customerId)
                    .productId(product.getId())
                    .build());
        }
        return list();
    }

    public List<ProductSummaryDto> remove(UUID productId) {
        UUID customerId = requireCustomerId();
        wishlistRepository.findByCustomerIdAndProductIdAndDeletedAtIsNull(customerId, productId)
                .ifPresent(item -> {
                    item.setDeletedAt(Instant.now());
                    wishlistRepository.save(item);
                });
        return list();
    }

    public void moveToCart(UUID productId) {
        UUID customerId = requireCustomerId();
        if (wishlistRepository.existsByCustomerIdAndProductIdAndDeletedAtIsNull(customerId, productId)) {
            cartService.addItem(null, new AddCartItemRequest(productId, 1, null, null));
            remove(productId);
        }
    }

    private UUID requireCustomerId() {
        UUID userId = currentUserProvider.getCurrentUserId();
        return customerRepository.findByUserId(userId)
                .map(Customer::getId)
                .orElseThrow(() -> new BusinessException(ErrorCode.FORBIDDEN, "Customer profile required"));
    }
}
