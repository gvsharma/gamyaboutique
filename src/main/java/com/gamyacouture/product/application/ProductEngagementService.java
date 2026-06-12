package com.gamyacouture.product.application;

import com.gamyacouture.customer.domain.Customer;
import com.gamyacouture.customer.infrastructure.CustomerJpaRepository;
import com.gamyacouture.product.api.dto.ProductSummaryDto;
import com.gamyacouture.product.domain.Product;
import com.gamyacouture.product.domain.ProductStatus;
import com.gamyacouture.product.domain.RecentlyViewedProduct;
import com.gamyacouture.product.infrastructure.ProductJpaRepository;
import com.gamyacouture.product.infrastructure.RecentlyViewedProductJpaRepository;
import com.gamyacouture.product.infrastructure.mapper.ProductMapper;
import com.gamyacouture.shared.security.CurrentUserProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductEngagementService {

    private final RecentlyViewedProductJpaRepository recentlyViewedRepository;
    private final ProductJpaRepository productRepository;
    private final ProductMapper productMapper;
    private final CustomerJpaRepository customerRepository;
    private final CurrentUserProvider currentUserProvider;

    @Transactional
    public void recordView(UUID productId) {
        currentUserProvider.getCurrentUserIdOptional().ifPresent(userId ->
                customerRepository.findByUserId(userId).ifPresent(customer -> {
                    productRepository.findById(productId).ifPresent(product -> {
                        RecentlyViewedProduct entry = recentlyViewedRepository
                                .findByCustomerIdAndProductId(customer.getId(), productId)
                                .orElseGet(() -> RecentlyViewedProduct.builder()
                                        .id(UUID.randomUUID())
                                        .customerId(customer.getId())
                                        .productId(productId)
                                        .build());
                        entry.setViewedAt(Instant.now());
                        recentlyViewedRepository.save(entry);
                    });
                }));
    }

    @Transactional(readOnly = true)
    public List<ProductSummaryDto> recentlyViewed() {
        return currentUserProvider.getCurrentUserIdOptional()
                .flatMap(userId -> customerRepository.findByUserId(userId))
                .map(customer -> recentlyViewedRepository.findTop20ByCustomerIdOrderByViewedAtDesc(customer.getId())
                        .stream()
                        .map(v -> productRepository.findById(v.getProductId()).orElse(null))
                        .filter(p -> p != null && p.getDeletedAt() == null && p.getStatus() == ProductStatus.ACTIVE)
                        .map(productMapper::toSummary)
                        .toList())
                .orElse(List.of());
    }

    @Transactional(readOnly = true)
    public List<ProductSummaryDto> relatedProducts(UUID productId) {
        Product product = productRepository.findById(productId).orElse(null);
        if (product == null || product.getPrimaryCategory() == null) {
            return List.of();
        }
        UUID categoryId = product.getPrimaryCategory().getId();
        return productRepository.findActiveByCategoryExcluding(categoryId, productId, ProductStatus.ACTIVE, PageRequest.of(0, 8))
                .stream()
                .map(productMapper::toSummary)
                .toList();
    }
}
