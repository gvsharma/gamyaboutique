package com.gamyacouture.wishlist.infrastructure;

import com.gamyacouture.wishlist.domain.WishlistItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WishlistItemJpaRepository extends JpaRepository<WishlistItem, UUID> {

    List<WishlistItem> findByCustomerIdAndDeletedAtIsNullOrderByCreatedAtDesc(UUID customerId);

    Optional<WishlistItem> findByCustomerIdAndProductIdAndDeletedAtIsNull(UUID customerId, UUID productId);

    boolean existsByCustomerIdAndProductIdAndDeletedAtIsNull(UUID customerId, UUID productId);

    Page<WishlistItem> findAllByDeletedAtIsNull(Pageable pageable);

    long countByCustomerIdAndDeletedAtIsNull(UUID customerId);
}
