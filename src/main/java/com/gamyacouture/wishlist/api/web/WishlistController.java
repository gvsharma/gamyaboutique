package com.gamyacouture.wishlist.api.web;

import com.gamyacouture.product.api.dto.ProductSummaryDto;
import com.gamyacouture.shared.web.ApiResponse;
import com.gamyacouture.wishlist.application.WishlistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

import static com.gamyacouture.shared.config.OpenApiConfig.BEARER_AUTH;

@RestController
@RequestMapping("/api/v1/wishlist")
@RequiredArgsConstructor
@Tag(name = "Wishlist")
@SecurityRequirement(name = BEARER_AUTH)
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    @Operation(summary = "List wishlist items for authenticated customer")
    public ApiResponse<List<ProductSummaryDto>> list() {
        return ApiResponse.ok(wishlistService.list());
    }

    @PostMapping("/items/{productId}")
    @Operation(summary = "Add product to wishlist")
    public ApiResponse<List<ProductSummaryDto>> add(@PathVariable UUID productId) {
        return ApiResponse.ok(wishlistService.add(productId), "Added to wishlist");
    }

    @DeleteMapping("/items/{productId}")
    @Operation(summary = "Remove product from wishlist")
    public ApiResponse<List<ProductSummaryDto>> remove(@PathVariable UUID productId) {
        return ApiResponse.ok(wishlistService.remove(productId), "Removed from wishlist");
    }

    @PostMapping("/items/{productId}/move-to-cart")
    @Operation(summary = "Move wishlist item to cart")
    public ApiResponse<Void> moveToCart(@PathVariable UUID productId) {
        wishlistService.moveToCart(productId);
        return ApiResponse.ok(null, "Moved to cart");
    }
}
