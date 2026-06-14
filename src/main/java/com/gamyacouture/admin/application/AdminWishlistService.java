package com.gamyacouture.admin.application;

import com.gamyacouture.admin.api.dto.AdminWishlistSummaryDto;
import com.gamyacouture.customer.domain.Customer;
import com.gamyacouture.customer.infrastructure.CustomerJpaRepository;
import com.gamyacouture.product.domain.Product;
import com.gamyacouture.product.infrastructure.ProductJpaRepository;
import com.gamyacouture.shared.exception.ResourceNotFoundException;
import com.gamyacouture.wishlist.domain.WishlistItem;
import com.gamyacouture.wishlist.infrastructure.WishlistItemJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminWishlistService {

    private final WishlistItemJpaRepository wishlistRepository;
    private final CustomerJpaRepository customerRepository;
    private final ProductJpaRepository productRepository;

    public Page<AdminWishlistSummaryDto> list(Pageable pageable) {
        Page<WishlistItem> page = wishlistRepository.findAllByDeletedAtIsNull(pageable);
        Map<UUID, Customer> customers = customerRepository.findAllById(
                page.getContent().stream().map(WishlistItem::getCustomerId).distinct().toList())
                .stream()
                .collect(Collectors.toMap(Customer::getId, Function.identity()));
        Map<UUID, Product> products = productRepository.findAllById(
                page.getContent().stream().map(WishlistItem::getProductId).distinct().toList())
                .stream()
                .collect(Collectors.toMap(Product::getId, Function.identity()));
        return page.map(item -> toSummary(item, customers.get(item.getCustomerId()), products.get(item.getProductId())));
    }

    @Transactional
    public void delete(UUID id) {
        WishlistItem item = wishlistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Wishlist item not found: " + id));
        item.setDeletedAt(Instant.now());
    }

    private static AdminWishlistSummaryDto toSummary(WishlistItem item, Customer customer, Product product) {
        String customerName = null;
        String customerEmail = null;
        if (customer != null) {
            customerEmail = customer.getEmail();
            String first = customer.getFirstName() != null ? customer.getFirstName() : "";
            String last = customer.getLastName() != null ? customer.getLastName() : "";
            customerName = (first + " " + last).trim();
            if (customerName.isEmpty()) {
                customerName = null;
            }
        }
        return new AdminWishlistSummaryDto(
                item.getId(),
                item.getCustomerId(),
                customerName,
                customerEmail,
                item.getProductId(),
                product != null ? product.getName() : "Unknown",
                item.getCreatedAt());
    }
}
