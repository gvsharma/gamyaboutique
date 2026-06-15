package com.gamyacouture.catalog.infrastructure;

import com.gamyacouture.catalog.domain.Print;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface PrintJpaRepository extends JpaRepository<Print, UUID> {

    List<Print> findByActiveTrueOrderByNameAsc();

    List<Print> findAllByOrderByNameAsc();

    java.util.Optional<Print> findByIdAndActiveTrue(UUID id);

    @Modifying(clearAutomatically = true)
    @Query("""
            UPDATE Print p
            SET p.active = false, p.deletedAt = :deletedAt
            WHERE p.id = :id
            """)
    int softDelete(@Param("id") UUID id, @Param("deletedAt") Instant deletedAt);
}
