package com.gamyacouture.product.infrastructure;

import com.gamyacouture.product.domain.RecentlyViewedProduct;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RecentlyViewedProductJpaRepository extends JpaRepository<RecentlyViewedProduct, UUID> {

    Optional<RecentlyViewedProduct> findByCustomerIdAndProductId(UUID customerId, UUID productId);

    List<RecentlyViewedProduct> findTop20ByCustomerIdOrderByViewedAtDesc(UUID customerId);
}
