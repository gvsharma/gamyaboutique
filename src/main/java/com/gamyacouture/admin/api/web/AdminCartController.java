package com.gamyacouture.admin.api.web;

import com.gamyacouture.admin.api.dto.AdminCartDetailDto;
import com.gamyacouture.admin.api.dto.AdminCartSummaryDto;
import com.gamyacouture.admin.application.AdminCartService;
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
@RequestMapping("/api/v1/admin/carts")
@RequiredArgsConstructor
@Validated
@Tag(name = "Admin Carts")
@SecurityRequirement(name = BEARER_AUTH)
@PreAuthorize("hasRole('ADMIN')")
public class AdminCartController {

    private final AdminCartService adminCartService;

    @GetMapping
    @Operation(summary = "List carts (paginated)")
    public ApiResponse<PageResponse<AdminCartSummaryDto>> list(
            @PageableDefault(size = 20, sort = "updatedAt", direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ApiResponse.ok(PageResponse.from(adminCartService.list(pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get cart detail with items")
    public ApiResponse<AdminCartDetailDto> getById(@PathVariable UUID id) {
        return ApiResponse.ok(adminCartService.getById(id));
    }
}
