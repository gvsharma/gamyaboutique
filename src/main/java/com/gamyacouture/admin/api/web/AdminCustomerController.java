package com.gamyacouture.admin.api.web;

import com.gamyacouture.admin.api.dto.AdminCustomerDetailDto;
import com.gamyacouture.admin.api.dto.AdminCustomerSummaryDto;
import com.gamyacouture.admin.application.AdminCustomerService;
import com.gamyacouture.shared.web.ApiResponse;
import com.gamyacouture.shared.web.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

import static com.gamyacouture.shared.config.OpenApiConfig.BEARER_AUTH;

@RestController
@RequestMapping("/api/v1/admin/customers")
@RequiredArgsConstructor
@Validated
@Tag(name = "Admin Customers")
@SecurityRequirement(name = BEARER_AUTH)
@PreAuthorize("hasRole('ADMIN')")
public class AdminCustomerController {

    private final AdminCustomerService adminCustomerService;

    @GetMapping
    @Operation(summary = "List customers (paginated)")
    public ApiResponse<PageResponse<AdminCustomerSummaryDto>> list(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ApiResponse.ok(PageResponse.from(adminCustomerService.list(pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get customer detail")
    public ApiResponse<AdminCustomerDetailDto> getById(@PathVariable UUID id) {
        return ApiResponse.ok(adminCustomerService.getById(id));
    }
}
