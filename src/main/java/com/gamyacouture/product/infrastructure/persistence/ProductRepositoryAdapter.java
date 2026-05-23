package com.gamyacouture.product.infrastructure.persistence;

import com.gamyacouture.product.domain.Product;
import com.gamyacouture.product.domain.ProductStatus;
import com.gamyacouture.product.domain.repository.ProductFilter;
import com.gamyacouture.product.domain.repository.ProductRepository;
import com.gamyacouture.product.infrastructure.ProductJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ProductRepositoryAdapter implements ProductRepository {

    private final ProductJpaRepository jpaProductRepository;

    @Override
    public Page<Product> findAll(ProductFilter filter, Pageable pageable) {
        return jpaProductRepository.findAll(ProductSpecifications.fromFilter(filter), pageable);
    }

    @Override
    public Optional<Product> findActiveWithDetailsById(UUID id) {
        return jpaProductRepository.findActiveWithDetailsById(id, ProductStatus.ACTIVE);
    }
}
