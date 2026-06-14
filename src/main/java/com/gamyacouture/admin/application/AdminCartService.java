package com.gamyacouture.admin.application;

import com.gamyacouture.admin.api.dto.AdminCartDetailDto;
import com.gamyacouture.admin.api.dto.AdminCartItemDto;
import com.gamyacouture.admin.api.dto.AdminCartSummaryDto;
import com.gamyacouture.cart.domain.Cart;
import com.gamyacouture.cart.domain.CartItem;
import com.gamyacouture.cart.infrastructure.CartItemJpaRepository;
import com.gamyacouture.cart.infrastructure.CartJpaRepository;
import com.gamyacouture.customer.domain.Customer;
import com.gamyacouture.customer.infrastructure.CustomerJpaRepository;
import com.gamyacouture.product.domain.Product;
import com.gamyacouture.product.infrastructure.ProductJpaRepository;
import com.gamyacouture.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminCartService {

    private final CartJpaRepository cartRepository;
    private final CartItemJpaRepository cartItemRepository;
    private final CustomerJpaRepository customerRepository;
    private final ProductJpaRepository productRepository;

    public Page<AdminCartSummaryDto> list(Pageable pageable) {
        return cartRepository.findAllByDeletedAtIsNull(pageable).map(this::toSummary);
    }

    public AdminCartDetailDto getById(UUID id) {
        Cart cart = cartRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found: " + id));
        Customer customer = cart.getCustomerId() != null
                ? customerRepository.findById(cart.getCustomerId()).orElse(null)
                : null;
        List<CartItem> items = cartItemRepository.findByCartIdOrderByAddedAtAsc(id);
        Map<UUID, Product> products = productRepository.findAllById(
                items.stream().map(CartItem::getProductId).distinct().toList())
                .stream()
                .collect(Collectors.toMap(Product::getId, Function.identity()));
        List<AdminCartItemDto> itemDtos = items.stream()
                .map(item -> {
                    Product product = products.get(item.getProductId());
                    return new AdminCartItemDto(
                            item.getId(),
                            item.getProductId(),
                            product != null ? product.getName() : "Unknown",
                            product != null ? product.getSku() : "—",
                            item.getQuantity(),
                            product != null ? product.getPrice() : null);
                })
                .toList();
        return new AdminCartDetailDto(
                cart.getId(),
                cart.getCustomerId(),
                cart.getGuestToken(),
                cart.getStatus(),
                cart.getCreatedAt(),
                cart.getUpdatedAt(),
                customerEmail(customer),
                customerName(customer),
                itemDtos);
    }

    private AdminCartSummaryDto toSummary(Cart cart) {
        Customer customer = cart.getCustomerId() != null
                ? customerRepository.findById(cart.getCustomerId()).orElse(null)
                : null;
        return new AdminCartSummaryDto(
                cart.getId(),
                cart.getCustomerId(),
                cart.getGuestToken(),
                cart.getStatus(),
                cartItemRepository.countByCartId(cart.getId()),
                cart.getUpdatedAt(),
                customerEmail(customer),
                customerName(customer));
    }

    private static String customerEmail(Customer customer) {
        return customer != null ? customer.getEmail() : null;
    }

    private static String customerName(Customer customer) {
        if (customer == null) {
            return null;
        }
        String first = customer.getFirstName() != null ? customer.getFirstName() : "";
        String last = customer.getLastName() != null ? customer.getLastName() : "";
        String name = (first + " " + last).trim();
        return name.isEmpty() ? null : name;
    }
}
