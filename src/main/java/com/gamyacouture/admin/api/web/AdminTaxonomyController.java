package com.gamyacouture.admin.api.web;

import com.gamyacouture.admin.api.dto.TaxonomyOptionDto;
import com.gamyacouture.admin.application.AdminTaxonomyService;
import com.gamyacouture.shared.web.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import static com.gamyacouture.shared.config.OpenApiConfig.BEARER_AUTH;

@RestController
@RequestMapping("/api/v1/admin/taxonomy")
@RequiredArgsConstructor
@Tag(name = "Admin Taxonomy")
@SecurityRequirement(name = BEARER_AUTH)
@PreAuthorize("hasRole('ADMIN')")
public class AdminTaxonomyController {

    private final AdminTaxonomyService adminTaxonomyService;

    @GetMapping("/fabrics")
    @Operation(summary = "List fabrics for product forms")
    public ApiResponse<List<TaxonomyOptionDto>> fabrics() {
        return ApiResponse.ok(adminTaxonomyService.listFabrics());
    }

    @GetMapping("/prints")
    @Operation(summary = "List prints for product forms")
    public ApiResponse<List<TaxonomyOptionDto>> prints() {
        return ApiResponse.ok(adminTaxonomyService.listPrints());
    }
}
