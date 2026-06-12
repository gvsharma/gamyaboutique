package com.gamyacouture.product.infrastructure;

import com.gamyacouture.product.domain.Product;
import com.gamyacouture.product.domain.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface ProductJpaRepository extends JpaRepository<Product, UUID>, JpaSpecificationExecutor<Product> {

    long countByStatus(ProductStatus status);

    @EntityGraph(attributePaths = {"images", "fabric", "print", "offer", "tags", "primaryCategory"})
    Optional<Product> findByIdAndStatus(UUID id, ProductStatus status);

    @EntityGraph(attributePaths = {"images", "fabric", "print", "offer", "tags"})
    @Query("SELECT p FROM Product p WHERE p.id = :id AND p.status = :status")
    Optional<Product> findActiveWithDetailsById(@Param("id") UUID id, @Param("status") ProductStatus status);

    @EntityGraph(attributePaths = {"images", "fabric", "print", "offer", "tags"})
    Page<Product> findByStatus(ProductStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"images", "fabric", "print", "offer", "tags"})
    @Query("""
            SELECT DISTINCT p FROM Product p
            JOIN ProductCategoryLink pcl ON pcl.productId = p.id
            WHERE pcl.categoryId = :categoryId AND p.status = :status
            """)
    Page<Product> findActiveByCategory(
            @Param("categoryId") UUID categoryId,
            @Param("status") ProductStatus status,
            Pageable pageable);

    @EntityGraph(attributePaths = {"images", "fabric", "print", "offer", "tags", "primaryCategory"})
    Optional<Product> findDetailedById(UUID id);

    boolean existsBySku(String sku);

    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM Product p WHERE p.sku = :sku AND p.id <> :id")
    boolean existsBySkuAndIdNot(@Param("sku") String sku, @Param("id") UUID id);

    @EntityGraph(attributePaths = {"images", "fabric", "print", "offer", "tags"})
    @Query("""
            SELECT p FROM Product p
            WHERE p.primaryCategory.id = :categoryId
              AND p.id <> :excludeId
              AND p.status = :status
              AND p.deletedAt IS NULL
            """)
    java.util.List<Product> findActiveByCategoryExcluding(
            @Param("categoryId") UUID categoryId,
            @Param("excludeId") UUID excludeId,
            @Param("status") ProductStatus status,
            Pageable pageable);
}
