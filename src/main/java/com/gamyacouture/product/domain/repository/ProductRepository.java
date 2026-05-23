package com.gamyacouture.product.domain.repository;

import com.gamyacouture.product.domain.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;

public interface ProductRepository {

    Page<Product> findAll(ProductFilter filter, Pageable pageable);

    Optional<Product> findActiveWithDetailsById(UUID id);
}
