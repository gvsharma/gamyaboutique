package com.gamyacouture.catalog.infrastructure;

import com.gamyacouture.catalog.domain.Fabric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface FabricJpaRepository extends JpaRepository<Fabric, UUID> {

    List<Fabric> findByActiveTrueOrderByNameAsc();

    List<Fabric> findAllByOrderByNameAsc();

    java.util.Optional<Fabric> findByIdAndActiveTrue(UUID id);

    @Modifying(clearAutomatically = true)
    @Query("""
            UPDATE Fabric f
            SET f.active = false, f.deletedAt = :deletedAt
            WHERE f.id = :id
            """)
    int softDelete(@Param("id") UUID id, @Param("deletedAt") Instant deletedAt);
}
