package com.gamyacouture.product.api.web;

import com.gamyacouture.product.api.dto.AdminProductListFilter;
import com.gamyacouture.product.api.dto.BulkProductImportRequest;
import com.gamyacouture.product.api.dto.BulkProductImportResultDto;
import com.gamyacouture.product.api.dto.BulkProductPreviewResponse;
import com.gamyacouture.product.api.dto.ProductDetailDto;
import com.gamyacouture.product.api.dto.ProductSummaryDto;
import com.gamyacouture.product.api.dto.UpdateProductStatusRequest;
import com.gamyacouture.product.api.dto.UpsertProductRequest;
import com.gamyacouture.product.application.AdminProductQueryService;
import com.gamyacouture.product.application.ProductBulkImportService;
import com.gamyacouture.product.application.ProductCommandService;
import com.gamyacouture.shared.web.ApiResponse;
import com.gamyacouture.shared.web.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

import static com.gamyacouture.shared.config.OpenApiConfig.BEARER_AUTH;

@RestController
@RequestMapping("/api/v1/admin/products")
@RequiredArgsConstructor
@Validated
@Tag(name = "Admin Products")
@SecurityRequirement(name = BEARER_AUTH)
@PreAuthorize("hasRole('ADMIN')")
public class AdminProductController {

    private final AdminProductQueryService adminProductQueryService;
    private final ProductCommandService productCommandService;
    private final ProductBulkImportService productBulkImportService;

    @GetMapping
    @Operation(summary = "List products for admin (all statuses)")
    public ApiResponse<PageResponse<ProductSummaryDto>> list(
            @ModelAttribute @ParameterObject AdminProductListFilter filter,
            @ParameterObject
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ApiResponse.ok(PageResponse.from(adminProductQueryService.list(filter, pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product details for admin")
    public ApiResponse<ProductDetailDto> getById(@PathVariable UUID id) {
        return ApiResponse.ok(adminProductQueryService.findById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a product with S3 image URLs")
    public ApiResponse<ProductDetailDto> create(@Valid @RequestBody UpsertProductRequest request) {
        return ApiResponse.ok(productCommandService.create(request), "Product created");
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a product")
    public ApiResponse<ProductDetailDto> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpsertProductRequest request) {
        return ApiResponse.ok(productCommandService.update(id, request), "Product updated");
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update product status (DRAFT, ACTIVE, ARCHIVED)")
    public ApiResponse<ProductDetailDto> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateProductStatusRequest request) {
        return ApiResponse.ok(productCommandService.updateStatus(id, request.status()), "Status updated");
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Soft-delete a product")
    public void delete(@PathVariable UUID id) {
        productCommandService.delete(id);
    }

    @PostMapping("/bulk/preview")
    @Operation(summary = "Parse and validate a product CSV file for bulk import")
    public ApiResponse<BulkProductPreviewResponse> previewBulkImport(@RequestPart("file") MultipartFile file)
            throws IOException {
        return ApiResponse.ok(productBulkImportService.preview(file), "CSV parsed");
    }

    @PostMapping("/bulk/import")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Import validated products from a bulk CSV preview")
    public ApiResponse<BulkProductImportResultDto> importBulk(@Valid @RequestBody BulkProductImportRequest request) {
        return ApiResponse.ok(
                productBulkImportService.importProducts(request.products()),
                "Bulk import completed");
    }
}
