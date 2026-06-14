package com.gamyacouture.admin.api.web;

import com.gamyacouture.admin.api.dto.AdminUserDetailDto;
import com.gamyacouture.admin.api.dto.AdminUserSummaryDto;
import com.gamyacouture.admin.api.dto.UpdateUserEnabledRequest;
import com.gamyacouture.admin.application.AdminUserService;
import com.gamyacouture.shared.web.ApiResponse;
import com.gamyacouture.shared.web.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

import static com.gamyacouture.shared.config.OpenApiConfig.BEARER_AUTH;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@Validated
@Tag(name = "Admin Users")
@SecurityRequirement(name = BEARER_AUTH)
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    @Operation(summary = "List user accounts (paginated)")
    public ApiResponse<PageResponse<AdminUserSummaryDto>> list(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ApiResponse.ok(PageResponse.from(adminUserService.list(pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user account detail")
    public ApiResponse<AdminUserDetailDto> getById(@PathVariable UUID id) {
        return ApiResponse.ok(adminUserService.getById(id));
    }

    @PatchMapping("/{id}/enabled")
    @Operation(summary = "Enable or disable a user account")
    public ApiResponse<AdminUserSummaryDto> updateEnabled(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserEnabledRequest request) {
        return ApiResponse.ok(adminUserService.updateEnabled(id, request), "User updated");
    }
}
