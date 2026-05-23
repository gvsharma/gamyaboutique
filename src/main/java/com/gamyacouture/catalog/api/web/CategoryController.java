package com.gamyacouture.catalog.api.web;

import com.gamyacouture.catalog.api.dto.CategoryTreeNodeDto;
import com.gamyacouture.catalog.application.CategoryTreeService;
import com.gamyacouture.shared.web.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Categories", description = "Product category hierarchy")
@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryTreeService categoryTreeService;

    @Operation(summary = "Get active category tree")
    @GetMapping("/tree")
    public ApiResponse<List<CategoryTreeNodeDto>> getCategoryTree() {
        return ApiResponse.ok(categoryTreeService.getCategoryTree());
    }
}
