package com.gamyacouture.product.infrastructure;

import com.gamyacouture.product.domain.ProductCategoryLink;
import com.gamyacouture.product.domain.ProductCategoryLinkId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProductCategoryLinkJpaRepository extends JpaRepository<ProductCategoryLink, ProductCategoryLinkId> {

    List<ProductCategoryLink> findByProductId(UUID productId);

    void deleteByProductId(UUID productId);
}
