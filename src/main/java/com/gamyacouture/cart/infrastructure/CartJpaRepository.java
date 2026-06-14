package com.gamyacouture.cart.infrastructure;

import com.gamyacouture.cart.domain.Cart;
import com.gamyacouture.cart.domain.CartStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CartJpaRepository extends JpaRepository<Cart, UUID> {

    Optional<Cart> findByCustomerIdAndStatusAndDeletedAtIsNull(UUID customerId, CartStatus status);

    Optional<Cart> findByGuestTokenAndStatusAndDeletedAtIsNull(UUID guestToken, CartStatus status);

    Page<Cart> findAllByDeletedAtIsNull(Pageable pageable);

    long countByCustomerIdAndDeletedAtIsNull(UUID customerId);
}
