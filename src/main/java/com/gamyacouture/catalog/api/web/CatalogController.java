package com.gamyacouture.catalog.api.web;

import com.gamyacouture.catalog.api.dto.CategoryDto;
import com.gamyacouture.catalog.application.CategoryBrowseService;
import com.gamyacouture.product.api.dto.ProductSummaryDto;
import com.gamyacouture.shared.web.ApiResponse;
import com.gamyacouture.shared.web.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/catalog")
@RequiredArgsConstructor
public class CatalogController {

    private final CategoryBrowseService categoryBrowseService;

    @GetMapping("/categories")
    public ApiResponse<List<CategoryDto>> listCategories() {
        return ApiResponse.ok(categoryBrowseService.listActiveCategories());
    }

    @GetMapping("/categories/{slug}/products")
    public ApiResponse<PageResponse<ProductSummaryDto>> categoryProducts(
            @PathVariable String slug,
            @PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.ok(PageResponse.from(categoryBrowseService.productsBySlug(slug, pageable)));
    }
}
