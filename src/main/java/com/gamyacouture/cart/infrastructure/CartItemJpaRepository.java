package com.gamyacouture.cart.infrastructure;

import com.gamyacouture.cart.domain.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CartItemJpaRepository extends JpaRepository<CartItem, UUID> {

    List<CartItem> findByCartIdOrderByAddedAtAsc(UUID cartId);

    @Query("""
            SELECT ci FROM CartItem ci
            WHERE ci.cartId = :cartId AND ci.productId = :productId
              AND COALESCE(ci.selectedSize, '') = COALESCE(:size, '')
              AND COALESCE(ci.selectedColor, '') = COALESCE(:color, '')
            """)
    Optional<CartItem> findMatching(
            @Param("cartId") UUID cartId,
            @Param("productId") UUID productId,
            @Param("size") String size,
            @Param("color") String color);

    void deleteByCartId(UUID cartId);

    int countByCartId(UUID cartId);
}
