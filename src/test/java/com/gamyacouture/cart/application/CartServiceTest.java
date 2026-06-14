package com.gamyacouture.cart.application;

import com.gamyacouture.cart.api.dto.AddCartItemRequest;
import com.gamyacouture.cart.api.dto.UpdateCartItemRequest;
import com.gamyacouture.cart.domain.Cart;
import com.gamyacouture.cart.domain.CartItem;
import com.gamyacouture.cart.domain.CartStatus;
import com.gamyacouture.cart.infrastructure.CartItemJpaRepository;
import com.gamyacouture.cart.infrastructure.CartJpaRepository;
import com.gamyacouture.customer.infrastructure.CustomerJpaRepository;
import com.gamyacouture.product.domain.Product;
import com.gamyacouture.product.domain.ProductStatus;
import com.gamyacouture.product.infrastructure.ProductJpaRepository;
import com.gamyacouture.product.infrastructure.mapper.ProductMapper;
import com.gamyacouture.shared.exception.BusinessException;
import com.gamyacouture.shared.exception.ResourceNotFoundException;
import com.gamyacouture.shared.security.CurrentUserProvider;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock private CartJpaRepository cartRepository;
    @Mock private CartItemJpaRepository cartItemRepository;
    @Mock private ProductJpaRepository productRepository;
    @Mock private ProductMapper productMapper;
    @Mock private CustomerJpaRepository customerRepository;
    @Mock private CurrentUserProvider currentUserProvider;

    @InjectMocks
    private CartService cartService;

    private final UUID guestToken = UUID.randomUUID();
    private final UUID cartId = UUID.randomUUID();
    private final UUID productId = UUID.randomUUID();

    @Test
    void addItem_incrementsQuantityAndValidatesTotalStock() {
        Cart cart = Cart.builder().id(cartId).guestToken(guestToken).status(CartStatus.ACTIVE).build();
        Product product = Product.builder().id(productId).status(ProductStatus.ACTIVE).stockQuantity(5).build();
        CartItem existing = CartItem.builder().id(UUID.randomUUID()).cartId(cartId).productId(productId).quantity(3).build();

        when(currentUserProvider.getCurrentUserIdOptional()).thenReturn(Optional.empty());
        when(cartRepository.findByGuestTokenAndStatusAndDeletedAtIsNull(guestToken, CartStatus.ACTIVE))
                .thenReturn(Optional.of(cart));
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(cartItemRepository.findMatching(cartId, productId, null, null)).thenReturn(Optional.of(existing));
        when(cartItemRepository.findByCartIdOrderByAddedAtAsc(cartId)).thenReturn(List.of(existing));
        when(productMapper.toSummary(product)).thenReturn(
                new com.gamyacouture.product.api.dto.ProductSummaryDto(
                        productId, "SKU", "Dress", ProductStatus.ACTIVE,
                        BigDecimal.TEN, null, BigDecimal.TEN, false, "INR",
                        null, null, null, null, null, null));

        cartService.addItem(guestToken, new AddCartItemRequest(productId, 2, null, null));

        assertThat(existing.getQuantity()).isEqualTo(5);
        verify(cartItemRepository).save(existing);
    }

    @Test
    void addItem_exceedsStock_throws() {
        Cart cart = Cart.builder().id(cartId).guestToken(guestToken).status(CartStatus.ACTIVE).build();
        Product product = Product.builder().id(productId).status(ProductStatus.ACTIVE).stockQuantity(2).build();
        CartItem existing = CartItem.builder().cartId(cartId).productId(productId).quantity(2).build();

        when(currentUserProvider.getCurrentUserIdOptional()).thenReturn(Optional.empty());
        when(cartRepository.findByGuestTokenAndStatusAndDeletedAtIsNull(guestToken, CartStatus.ACTIVE))
                .thenReturn(Optional.of(cart));
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(cartItemRepository.findMatching(cartId, productId, null, null)).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> cartService.addItem(guestToken, new AddCartItemRequest(productId, 1, null, null)))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void removeItem_deletesLine() {
        UUID itemId = UUID.randomUUID();
        Cart cart = Cart.builder().id(cartId).guestToken(guestToken).status(CartStatus.ACTIVE).build();
        CartItem item = CartItem.builder().id(itemId).cartId(cartId).productId(productId).quantity(1).build();

        when(currentUserProvider.getCurrentUserIdOptional()).thenReturn(Optional.empty());
        when(cartRepository.findByGuestTokenAndStatusAndDeletedAtIsNull(guestToken, CartStatus.ACTIVE))
                .thenReturn(Optional.of(cart));
        when(cartItemRepository.findById(itemId)).thenReturn(Optional.of(item));
        when(cartItemRepository.findByCartIdOrderByAddedAtAsc(cartId)).thenReturn(List.of());

        cartService.removeItem(guestToken, itemId);

        verify(cartItemRepository).delete(item);
    }

    @Test
    void updateItem_setsQuantity() {
        UUID itemId = UUID.randomUUID();
        Cart cart = Cart.builder().id(cartId).guestToken(guestToken).status(CartStatus.ACTIVE).build();
        CartItem item = CartItem.builder().id(itemId).cartId(cartId).productId(productId).quantity(1).build();
        Product product = Product.builder().id(productId).status(ProductStatus.ACTIVE).stockQuantity(10).build();

        when(currentUserProvider.getCurrentUserIdOptional()).thenReturn(Optional.empty());
        when(cartRepository.findByGuestTokenAndStatusAndDeletedAtIsNull(guestToken, CartStatus.ACTIVE))
                .thenReturn(Optional.of(cart));
        when(cartItemRepository.findById(itemId)).thenReturn(Optional.of(item));
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(cartItemRepository.findByCartIdOrderByAddedAtAsc(cartId)).thenReturn(List.of(item));
        when(productMapper.toSummary(any())).thenReturn(
                new com.gamyacouture.product.api.dto.ProductSummaryDto(
                        productId, "SKU", "Dress", ProductStatus.ACTIVE,
                        BigDecimal.TEN, null, BigDecimal.TEN, false, "INR",
                        null, null, null, null, null, null));

        cartService.updateItem(guestToken, itemId, new UpdateCartItemRequest(3));

        assertThat(item.getQuantity()).isEqualTo(3);
    }

    @Test
    void addItem_inactiveProduct_notFound() {
        Cart cart = Cart.builder().id(cartId).guestToken(guestToken).status(CartStatus.ACTIVE).build();
        Product product = Product.builder().id(productId).status(ProductStatus.ARCHIVED).build();

        when(currentUserProvider.getCurrentUserIdOptional()).thenReturn(Optional.empty());
        when(cartRepository.findByGuestTokenAndStatusAndDeletedAtIsNull(guestToken, CartStatus.ACTIVE))
                .thenReturn(Optional.of(cart));
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));

        assertThatThrownBy(() -> cartService.addItem(guestToken, new AddCartItemRequest(productId, 1, null, null)))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
