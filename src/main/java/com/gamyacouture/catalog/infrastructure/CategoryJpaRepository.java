package com.gamyacouture.catalog.infrastructure;

import com.gamyacouture.catalog.domain.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public interface CategoryJpaRepository extends JpaRepository<Category, UUID> {

    long countByActiveTrue();

    @Query("""
            SELECT c FROM Category c
            LEFT JOIN FETCH c.parent
            WHERE c.active = true
            ORDER BY c.displayOrder ASC, c.name ASC
            """)
    List<Category> findByActiveTrueOrderByDisplayOrderAscNameAsc();

    Optional<Category> findByIdAndActiveTrue(UUID id);

    Optional<Category> findBySlugAndActiveTrue(String slug);

    List<Category> findAllByOrderByDisplayOrderAscNameAsc();

    List<Category> findByParentId(UUID parentId);

    boolean existsBySlugAndParentIsNull(String slug);

    boolean existsBySlugAndParentIsNullAndIdNot(String slug, UUID id);

    boolean existsBySlugAndParentId(String slug, UUID parentId);

    boolean existsBySlugAndParentIdAndIdNot(String slug, UUID parentId, UUID id);

    @Query("""
            SELECT c FROM Category c
            WHERE c.path = :path OR c.path LIKE CONCAT(:path, '/%')
            """)
    List<Category> findSelfAndDescendants(@Param("path") String path);

    @Query("""
            SELECT c.id FROM Category c
            WHERE c.active = true
            AND (c.path = :path OR c.path LIKE CONCAT(:path, '/%'))
            """)
    Set<UUID> findActiveIdsInSubtree(@Param("path") String path);
}
