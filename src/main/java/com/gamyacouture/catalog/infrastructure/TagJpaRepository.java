package com.gamyacouture.catalog.infrastructure;

import com.gamyacouture.catalog.domain.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface TagJpaRepository extends JpaRepository<Tag, UUID> {

    List<Tag> findAllByOrderByNameAsc();

    @Modifying(clearAutomatically = true)
    @Query("""
            UPDATE Tag t
            SET t.deletedAt = :deletedAt
            WHERE t.id = :id
            """)
    int softDelete(@Param("id") UUID id, @Param("deletedAt") Instant deletedAt);
}
