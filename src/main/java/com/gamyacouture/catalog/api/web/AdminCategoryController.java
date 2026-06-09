package com.gamyacouture.catalog.api.web;

import com.gamyacouture.catalog.api.dto.CategoryDto;
import com.gamyacouture.catalog.api.dto.UpsertCategoryRequest;
import com.gamyacouture.catalog.application.CategoryCommandService;
import com.gamyacouture.shared.web.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

import static com.gamyacouture.shared.config.OpenApiConfig.BEARER_AUTH;

@RestController
@RequestMapping("/api/v1/admin/categories")
@RequiredArgsConstructor
@Validated
@Tag(name = "Admin Categories")
@SecurityRequirement(name = BEARER_AUTH)
@PreAuthorize("hasRole('ADMIN')")
public class AdminCategoryController {

    private final CategoryCommandService categoryCommandService;

    @GetMapping
    @Operation(summary = "List all categories for admin")
    public ApiResponse<List<CategoryDto>> list() {
        return ApiResponse.ok(categoryCommandService.listAll());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a category")
    public ApiResponse<CategoryDto> create(@Valid @RequestBody UpsertCategoryRequest request) {
        return ApiResponse.ok(categoryCommandService.create(request), "Category created");
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a category")
    public ApiResponse<CategoryDto> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpsertCategoryRequest request) {
        return ApiResponse.ok(categoryCommandService.update(id, request), "Category updated");
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Deactivate a category")
    public void deactivate(@PathVariable UUID id) {
        categoryCommandService.deactivate(id);
    }
}
