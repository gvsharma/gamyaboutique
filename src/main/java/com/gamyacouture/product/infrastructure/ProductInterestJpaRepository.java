package com.gamyacouture.product.infrastructure;

import com.gamyacouture.product.domain.ProductInterest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.UUID;

public interface ProductInterestJpaRepository extends JpaRepository<ProductInterest, UUID> {

    long countByProductIdAndCreatedAtAfter(UUID productId, Instant since);

    @Query("SELECT COUNT(pi) FROM ProductInterest pi WHERE pi.createdAt >= :since")
    long countSince(@Param("since") Instant since);
}
