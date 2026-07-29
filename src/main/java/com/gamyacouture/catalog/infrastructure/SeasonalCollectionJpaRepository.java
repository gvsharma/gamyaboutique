package com.gamyacouture.catalog.infrastructure;

import com.gamyacouture.catalog.domain.SeasonalCollection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SeasonalCollectionJpaRepository extends JpaRepository<SeasonalCollection, UUID> {

    List<SeasonalCollection> findAllByOrderByDisplayOrderAscNameAsc();

    Optional<SeasonalCollection> findBySlugAndDeletedAtIsNull(String slug);

    Optional<SeasonalCollection> findByIdAndActiveTrue(UUID id);

    @Query("""
            SELECT sc FROM SeasonalCollection sc
            WHERE sc.active = true
              AND (sc.startsAt IS NULL OR sc.startsAt <= :today)
              AND (sc.endsAt IS NULL OR sc.endsAt >= :today)
            ORDER BY sc.displayOrder ASC, sc.name ASC
            """)
    List<SeasonalCollection> findCurrentlyVisible(@Param("today") LocalDate today);

    @Modifying(clearAutomatically = true)
    @Query("""
            UPDATE SeasonalCollection sc
            SET sc.deletedAt = :deletedAt, sc.active = false
            WHERE sc.id = :id
            """)
    int softDelete(@Param("id") UUID id, @Param("deletedAt") Instant deletedAt);
}
