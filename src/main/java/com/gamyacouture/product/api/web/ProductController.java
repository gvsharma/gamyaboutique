package com.gamyacouture.product.api.web;

import com.gamyacouture.product.api.ProductQueryApi;
import com.gamyacouture.product.api.dto.ProductDetailDto;
import com.gamyacouture.product.api.dto.ProductInterestCreatedResponse;
import com.gamyacouture.product.api.dto.ProductInterestRequest;
import com.gamyacouture.product.api.dto.ProductSummaryDto;
import com.gamyacouture.product.application.ProductInterestService;
import com.gamyacouture.shared.web.ApiResponse;
import com.gamyacouture.shared.web.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductQueryApi productQueryApi;
    private final ProductInterestService productInterestService;

    @GetMapping
    public ApiResponse<PageResponse<ProductSummaryDto>> list(
            @RequestParam(required = false) UUID categoryId,
            @PageableDefault(size = 20) Pageable pageable) {
        var page = categoryId != null
                ? productQueryApi.findByCategory(categoryId, pageable)
                : productQueryApi.findActive(pageable);
        return ApiResponse.ok(PageResponse.from(page));
    }

    @GetMapping("/{id}")
    public ApiResponse<ProductDetailDto> getById(@PathVariable UUID id) {
        return ApiResponse.ok(productQueryApi.findById(id));
    }

    @PostMapping("/{id}/interest")
    public ApiResponse<ProductInterestCreatedResponse> submitInterest(
            @PathVariable UUID id,
            @Valid @RequestBody ProductInterestRequest request) {
        return ApiResponse.ok(productInterestService.submitInterest(id, request));
    }
}
