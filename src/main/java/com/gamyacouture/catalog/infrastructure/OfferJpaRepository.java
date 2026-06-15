package com.gamyacouture.catalog.infrastructure;

import com.gamyacouture.catalog.domain.Offer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface OfferJpaRepository extends JpaRepository<Offer, UUID> {

    List<Offer> findAllByOrderByNameAsc();

    @Modifying(clearAutomatically = true)
    @Query("""
            UPDATE Offer o
            SET o.active = false, o.deletedAt = :deletedAt
            WHERE o.id = :id
            """)
    int softDelete(@Param("id") UUID id, @Param("deletedAt") Instant deletedAt);
}
