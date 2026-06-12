package com.gamyacouture.cart.application;

import com.gamyacouture.cart.api.dto.AddCartItemRequest;
import com.gamyacouture.cart.api.dto.CartDto;
import com.gamyacouture.cart.api.dto.CartItemDto;
import com.gamyacouture.cart.api.dto.UpdateCartItemRequest;
import com.gamyacouture.cart.domain.Cart;
import com.gamyacouture.cart.domain.CartItem;
import com.gamyacouture.cart.domain.CartStatus;
import com.gamyacouture.cart.infrastructure.CartItemJpaRepository;
import com.gamyacouture.cart.infrastructure.CartJpaRepository;
import com.gamyacouture.customer.domain.Customer;
import com.gamyacouture.customer.infrastructure.CustomerJpaRepository;
import com.gamyacouture.product.domain.Product;
import com.gamyacouture.product.domain.ProductStatus;
import com.gamyacouture.product.infrastructure.ProductJpaRepository;
import com.gamyacouture.product.infrastructure.mapper.ProductMapper;
import com.gamyacouture.shared.exception.BusinessException;
import com.gamyacouture.shared.exception.ErrorCode;
import com.gamyacouture.shared.exception.ResourceNotFoundException;
import com.gamyacouture.shared.security.CurrentUserProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class CartService {

    private static final long GUEST_CART_TTL_DAYS = 30;

    private final CartJpaRepository cartRepository;
    private final CartItemJpaRepository cartItemRepository;
    private final ProductJpaRepository productRepository;
    private final ProductMapper productMapper;
    private final CustomerJpaRepository customerRepository;
    private final CurrentUserProvider currentUserProvider;

    @Transactional(readOnly = true)
    public CartDto getCart(UUID guestToken) {
        Cart cart = resolveCart(guestToken).orElse(null);
        if (cart == null) {
            return emptyCart(guestToken);
        }
        return toDto(cart);
    }

    public CartDto addItem(UUID guestToken, AddCartItemRequest request) {
        Cart cart = resolveOrCreateCart(guestToken);
        Product product = productRepository.findById(request.productId())
                .filter(p -> p.getDeletedAt() == null && p.getStatus() == ProductStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + request.productId()));

        String size = blankToNull(request.selectedSize());
        String color = blankToNull(request.selectedColor());

        CartItem item = cartItemRepository.findMatching(cart.getId(), product.getId(), size, color)
                .orElseGet(() -> CartItem.builder()
                        .id(UUID.randomUUID())
                        .cartId(cart.getId())
                        .productId(product.getId())
                        .selectedSize(size)
                        .selectedColor(color)
                        .quantity(0)
                        .build());

        int newQuantity = item.getQuantity() + request.quantity();
        validateStock(product, newQuantity);
        item.setQuantity(newQuantity);
        item.setUpdatedAt(Instant.now());
        cartItemRepository.save(item);
        return toDto(cart);
    }

    public CartDto updateItem(UUID guestToken, UUID itemId, UpdateCartItemRequest request) {
        Cart cart = resolveOrCreateCart(guestToken);
        CartItem item = cartItemRepository.findById(itemId)
                .filter(i -> i.getCartId().equals(cart.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found: " + itemId));

        Product product = productRepository.findById(item.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        validateStock(product, request.quantity());

        item.setQuantity(request.quantity());
        item.setUpdatedAt(Instant.now());
        cartItemRepository.save(item);
        return toDto(cart);
    }

    public CartDto removeItem(UUID guestToken, UUID itemId) {
        Cart cart = resolveOrCreateCart(guestToken);
        CartItem item = cartItemRepository.findById(itemId)
                .filter(i -> i.getCartId().equals(cart.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found: " + itemId));
        cartItemRepository.delete(item);
        return toDto(cart);
    }

    public CartDto clearCart(UUID guestToken) {
        Cart cart = resolveOrCreateCart(guestToken);
        cartItemRepository.deleteByCartId(cart.getId());
        return toDto(cart);
    }

    private Optional<Cart> resolveCart(UUID guestToken) {
        Optional<UUID> customerId = currentCustomerId();
        if (customerId.isPresent()) {
            return cartRepository.findByCustomerIdAndStatusAndDeletedAtIsNull(customerId.get(), CartStatus.ACTIVE);
        }
        if (guestToken != null) {
            return cartRepository.findByGuestTokenAndStatusAndDeletedAtIsNull(guestToken, CartStatus.ACTIVE);
        }
        return Optional.empty();
    }

    private Cart resolveOrCreateCart(UUID guestToken) {
        return resolveCart(guestToken).orElseGet(() -> createCart(guestToken));
    }

    private Cart createCart(UUID guestToken) {
        Optional<UUID> customerId = currentCustomerId();
        UUID id = UUID.randomUUID();
        UUID token = customerId.isEmpty() ? (guestToken != null ? guestToken : UUID.randomUUID()) : null;

        Cart cart = Cart.builder()
                .id(id)
                .customerId(customerId.orElse(null))
                .guestToken(token)
                .status(CartStatus.ACTIVE)
                .expiresAt(customerId.isEmpty()
                        ? Instant.now().plusSeconds(GUEST_CART_TTL_DAYS * 24 * 3600L)
                        : null)
                .build();
        return cartRepository.save(cart);
    }

    private Optional<UUID> currentCustomerId() {
        return currentUserProvider.getCurrentUserIdOptional()
                .flatMap(userId -> customerRepository.findByUserId(userId).map(Customer::getId));
    }

    private CartDto toDto(Cart cart) {
        List<CartItem> items = cartItemRepository.findByCartIdOrderByAddedAtAsc(cart.getId());
        List<CartItemDto> itemDtos = items.stream()
                .map(item -> {
                    Product product = productRepository.findById(item.getProductId()).orElse(null);
                    if (product == null || product.getDeletedAt() != null || product.getStatus() != ProductStatus.ACTIVE) {
                        return null;
                    }
                    return new CartItemDto(
                            item.getId(),
                            item.getProductId(),
                            item.getQuantity(),
                            item.getSelectedSize(),
                            item.getSelectedColor(),
                            productMapper.toSummary(product));
                })
                .filter(dto -> dto != null)
                .toList();

        BigDecimal subtotal = itemDtos.stream()
                .filter(i -> i.product() != null)
                .map(i -> i.product().effectivePrice().multiply(BigDecimal.valueOf(i.quantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        String currency = itemDtos.stream()
                .map(i -> i.product() != null ? i.product().currency() : null)
                .filter(c -> c != null)
                .findFirst()
                .orElse("INR");

        int count = items.stream().mapToInt(CartItem::getQuantity).sum();
        return new CartDto(cart.getId(), cart.getGuestToken(), count, subtotal, currency, itemDtos);
    }

    private CartDto emptyCart(UUID guestToken) {
        return new CartDto(null, guestToken, 0, BigDecimal.ZERO, "INR", List.of());
    }

    private static void validateStock(Product product, int quantity) {
        if (product.getStockQuantity() != null && quantity > product.getStockQuantity()) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION, "Insufficient stock");
        }
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
