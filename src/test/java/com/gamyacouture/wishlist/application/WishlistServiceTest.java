package com.gamyacouture.wishlist.application;

import com.gamyacouture.cart.application.CartService;
import com.gamyacouture.customer.domain.Customer;
import com.gamyacouture.customer.infrastructure.CustomerJpaRepository;
import com.gamyacouture.product.domain.Product;
import com.gamyacouture.product.domain.ProductStatus;
import com.gamyacouture.product.infrastructure.ProductJpaRepository;
import com.gamyacouture.product.infrastructure.mapper.ProductMapper;
import com.gamyacouture.shared.security.CurrentUserProvider;
import com.gamyacouture.wishlist.domain.WishlistItem;
import com.gamyacouture.wishlist.infrastructure.WishlistItemJpaRepository;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WishlistServiceTest {

    @Mock private WishlistItemJpaRepository wishlistRepository;
    @Mock private CustomerJpaRepository customerRepository;
    @Mock private ProductJpaRepository productRepository;
    @Mock private ProductMapper productMapper;
    @Mock private CurrentUserProvider currentUserProvider;
    @Mock private CartService cartService;

    @InjectMocks
    private WishlistService wishlistService;

    private final UUID userId = UUID.randomUUID();
    private final UUID customerId = UUID.randomUUID();
    private final UUID productId = UUID.randomUUID();

    @Test
    void add_newProduct_savesItem() {
        Product product = Product.builder().id(productId).status(ProductStatus.ACTIVE).build();
        stubCustomer();
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(wishlistRepository.existsByCustomerIdAndProductIdAndDeletedAtIsNull(customerId, productId)).thenReturn(false);
        when(wishlistRepository.findByCustomerIdAndDeletedAtIsNullOrderByCreatedAtDesc(customerId)).thenReturn(List.of());
        when(wishlistRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        wishlistService.add(productId);

        verify(wishlistRepository).save(any(WishlistItem.class));
    }

    @Test
    void add_duplicate_skipsInsert() {
        Product product = Product.builder().id(productId).status(ProductStatus.ACTIVE).build();
        stubCustomer();
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(wishlistRepository.existsByCustomerIdAndProductIdAndDeletedAtIsNull(customerId, productId)).thenReturn(true);
        when(wishlistRepository.findByCustomerIdAndDeletedAtIsNullOrderByCreatedAtDesc(customerId)).thenReturn(List.of());

        wishlistService.add(productId);

        verify(wishlistRepository, never()).save(any());
    }

    @Test
    void remove_softDeletesItem() {
        WishlistItem item = WishlistItem.builder().id(UUID.randomUUID()).customerId(customerId).productId(productId).build();
        stubCustomer();
        when(wishlistRepository.findByCustomerIdAndProductIdAndDeletedAtIsNull(customerId, productId))
                .thenReturn(Optional.of(item));
        when(wishlistRepository.findByCustomerIdAndDeletedAtIsNullOrderByCreatedAtDesc(customerId)).thenReturn(List.of());

        wishlistService.remove(productId);

        assertThat(item.getDeletedAt()).isNotNull();
        verify(wishlistRepository).save(item);
    }

    @Test
    void list_filtersInactiveProducts() {
        WishlistItem item = WishlistItem.builder().customerId(customerId).productId(productId).build();
        Product archived = Product.builder().id(productId).status(ProductStatus.ARCHIVED).build();
        stubCustomer();
        when(wishlistRepository.findByCustomerIdAndDeletedAtIsNullOrderByCreatedAtDesc(customerId))
                .thenReturn(List.of(item));
        when(productRepository.findById(productId)).thenReturn(Optional.of(archived));

        assertThat(wishlistService.list()).isEmpty();
    }

    private void stubCustomer() {
        when(currentUserProvider.getCurrentUserId()).thenReturn(userId);
        when(customerRepository.findByUserId(userId)).thenReturn(Optional.of(
                Customer.builder().id(customerId).user(null).build()));
    }
}
