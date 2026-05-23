package com.gamyacouture.product.api.web;

import com.gamyacouture.product.api.ProductQueryApi;
import com.gamyacouture.product.api.dto.ProductDetailDto;
import com.gamyacouture.product.api.dto.ProductInterestCreatedResponse;
import com.gamyacouture.product.api.dto.ProductInterestRequest;
import com.gamyacouture.product.api.dto.ProductListFilter;
import com.gamyacouture.product.api.dto.ProductSearchRequest;
import com.gamyacouture.product.api.dto.ProductSummaryDto;
import com.gamyacouture.product.application.ProductInterestService;
import com.gamyacouture.shared.web.ApiResponse;
import com.gamyacouture.shared.web.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@Tag(name = "Products", description = "Catalog product browse, filter, and search APIs")
@Validated
@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductQueryApi productQueryApi;
    private final ProductInterestService productInterestService;

    @Operation(summary = "List products with pagination, sorting, filtering, and optional search")
    @GetMapping
    public ApiResponse<PageResponse<ProductSummaryDto>> listProducts(
            @Valid @ModelAttribute @ParameterObject ProductListFilter filter,
            @ParameterObject
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ApiResponse.ok(PageResponse.from(productQueryApi.list(filter, pageable)));
    }

    @Operation(summary = "Search products by query with optional filters")
    @GetMapping("/search")
    public ApiResponse<PageResponse<ProductSummaryDto>> searchProducts(
            @Valid @ModelAttribute @ParameterObject ProductSearchRequest searchRequest,
            @Valid @ModelAttribute @ParameterObject ProductListFilter filter,
            @ParameterObject
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ApiResponse.ok(PageResponse.from(
                productQueryApi.search(searchRequest.q(), filter, pageable)));
    }

    @Operation(summary = "Get product details by ID")
    @GetMapping("/{id}")
    public ApiResponse<ProductDetailDto> getProduct(
            @Parameter(description = "Product UUID") @PathVariable UUID id) {
        return ApiResponse.ok(productQueryApi.findById(id));
    }

    @Operation(summary = "Submit interest in a product (guest or logged-in)")
    @PostMapping("/{id}/interest")
    public ApiResponse<ProductInterestCreatedResponse> submitInterest(
            @PathVariable UUID id,
            @Valid @RequestBody ProductInterestRequest request) {
        return ApiResponse.ok(productInterestService.submitInterest(id, request));
    }
}
