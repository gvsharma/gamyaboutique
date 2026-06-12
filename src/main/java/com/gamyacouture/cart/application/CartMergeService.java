package com.gamyacouture.cart.application;

import com.gamyacouture.cart.domain.Cart;
import com.gamyacouture.cart.domain.CartItem;
import com.gamyacouture.cart.domain.CartStatus;
import com.gamyacouture.cart.infrastructure.CartItemJpaRepository;
import com.gamyacouture.cart.infrastructure.CartJpaRepository;
import com.gamyacouture.customer.infrastructure.CustomerJpaRepository;
import com.gamyacouture.product.domain.Product;
import com.gamyacouture.product.domain.ProductStatus;
import com.gamyacouture.product.infrastructure.ProductJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CartMergeService {

    private final CartJpaRepository cartRepository;
    private final CartItemJpaRepository cartItemRepository;
    private final CustomerJpaRepository customerRepository;
    private final ProductJpaRepository productRepository;

    @Transactional
    public void mergeGuestCart(UUID guestToken, UUID userId) {
        if (guestToken == null) {
            return;
        }
        UUID customerId = customerRepository.findByUserId(userId)
                .map(c -> c.getId())
                .orElse(null);
        if (customerId == null) {
            return;
        }

        cartRepository.findByGuestTokenAndStatusAndDeletedAtIsNull(guestToken, CartStatus.ACTIVE)
                .ifPresent(guestCart -> mergeIntoCustomerCart(guestCart, customerId));
    }

    private void mergeIntoCustomerCart(Cart guestCart, UUID customerId) {
        Cart customerCart = cartRepository.findByCustomerIdAndStatusAndDeletedAtIsNull(customerId, CartStatus.ACTIVE)
                .orElseGet(() -> {
                    Cart cart = Cart.builder()
                            .id(UUID.randomUUID())
                            .customerId(customerId)
                            .status(CartStatus.ACTIVE)
                            .build();
                    return cartRepository.save(cart);
                });

        List<CartItem> guestItems = cartItemRepository.findByCartIdOrderByAddedAtAsc(guestCart.getId());
        for (CartItem guestItem : guestItems) {
            Product product = productRepository.findById(guestItem.getProductId())
                    .filter(p -> p.getDeletedAt() == null && p.getStatus() == ProductStatus.ACTIVE)
                    .orElse(null);
            if (product == null) {
                continue;
            }

            int mergedQuantity = guestItem.getQuantity();
            var existingOpt = cartItemRepository.findMatching(
                    customerCart.getId(),
                    guestItem.getProductId(),
                    guestItem.getSelectedSize(),
                    guestItem.getSelectedColor());
            if (existingOpt.isPresent()) {
                mergedQuantity += existingOpt.get().getQuantity();
            }

            if (product.getStockQuantity() != null) {
                mergedQuantity = Math.min(mergedQuantity, product.getStockQuantity());
                if (mergedQuantity <= 0) {
                    continue;
                }
            }

            final int quantityToSet = mergedQuantity;
            cartItemRepository.findMatching(
                            customerCart.getId(),
                            guestItem.getProductId(),
                            guestItem.getSelectedSize(),
                            guestItem.getSelectedColor())
                    .ifPresentOrElse(existing -> {
                        existing.setQuantity(quantityToSet);
                        existing.setUpdatedAt(Instant.now());
                        cartItemRepository.save(existing);
                    }, () -> {
                        CartItem copy = CartItem.builder()
                                .id(UUID.randomUUID())
                                .cartId(customerCart.getId())
                                .productId(guestItem.getProductId())
                                .quantity(quantityToSet)
                                .selectedSize(guestItem.getSelectedSize())
                                .selectedColor(guestItem.getSelectedColor())
                                .build();
                        cartItemRepository.save(copy);
                    });
        }

        guestCart.setStatus(CartStatus.MERGED);
        cartRepository.save(guestCart);
        cartItemRepository.deleteByCartId(guestCart.getId());
    }
}
