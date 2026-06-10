package com.gamyacouture.cart.api.web;

import com.gamyacouture.cart.api.dto.AddCartItemRequest;
import com.gamyacouture.cart.api.dto.CartDto;
import com.gamyacouture.cart.api.dto.UpdateCartItemRequest;
import com.gamyacouture.cart.application.CartService;
import com.gamyacouture.cart.application.CartMergeService;
import com.gamyacouture.cart.application.CartService;
import com.gamyacouture.shared.security.CurrentUserProvider;
import com.gamyacouture.shared.web.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

import static com.gamyacouture.shared.config.OpenApiConfig.BEARER_AUTH;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
@Tag(name = "Cart")
public class CartController {

    private final CartService cartService;
    private final CartMergeService cartMergeService;
    private final CurrentUserProvider currentUserProvider;

    @GetMapping
    @Operation(summary = "Get current cart (guest or authenticated)")
    public ApiResponse<CartDto> getCart(
            @RequestHeader(value = "X-Guest-Cart-Id", required = false) UUID guestCartId) {
        return ApiResponse.ok(cartService.getCart(guestCartId));
    }

    @PostMapping("/items")
    @Operation(summary = "Add or increment cart item")
    public ApiResponse<CartDto> addItem(
            @RequestHeader(value = "X-Guest-Cart-Id", required = false) UUID guestCartId,
            @Valid @RequestBody AddCartItemRequest request) {
        return ApiResponse.ok(cartService.addItem(guestCartId, request), "Item added to cart");
    }

    @PatchMapping("/items/{itemId}")
    @Operation(summary = "Update cart item quantity")
    public ApiResponse<CartDto> updateItem(
            @RequestHeader(value = "X-Guest-Cart-Id", required = false) UUID guestCartId,
            @PathVariable UUID itemId,
            @Valid @RequestBody UpdateCartItemRequest request) {
        return ApiResponse.ok(cartService.updateItem(guestCartId, itemId, request), "Cart updated");
    }

    @DeleteMapping("/items/{itemId}")
    @Operation(summary = "Remove cart item")
    public ApiResponse<CartDto> removeItem(
            @RequestHeader(value = "X-Guest-Cart-Id", required = false) UUID guestCartId,
            @PathVariable UUID itemId) {
        return ApiResponse.ok(cartService.removeItem(guestCartId, itemId), "Item removed");
    }

    @DeleteMapping
    @Operation(summary = "Clear cart")
    public ApiResponse<CartDto> clearCart(
            @RequestHeader(value = "X-Guest-Cart-Id", required = false) UUID guestCartId) {
        return ApiResponse.ok(cartService.clearCart(guestCartId), "Cart cleared");
    }

    @PostMapping("/merge")
    @Operation(summary = "Merge guest cart into authenticated customer cart")
    @SecurityRequirement(name = BEARER_AUTH)
    public ApiResponse<CartDto> mergeGuestCart(
            @RequestHeader(value = "X-Guest-Cart-Id", required = false) UUID guestCartId) {
        cartMergeService.mergeGuestCart(guestCartId, currentUserProvider.getCurrentUserId());
        return ApiResponse.ok(cartService.getCart(null), "Cart merged");
    }
}
