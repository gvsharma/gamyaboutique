package com.gamyacouture.admin.api.web;

import com.gamyacouture.admin.api.dto.DashboardSummaryDto;
import com.gamyacouture.admin.api.dto.LeadsByStatusDto;
import com.gamyacouture.admin.application.AdminDashboardService;
import com.gamyacouture.shared.web.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static com.gamyacouture.shared.config.OpenApiConfig.BEARER_AUTH;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
@Tag(name = "Admin")
@SecurityRequirement(name = BEARER_AUTH)
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping("/summary")
    @Operation(summary = "Dashboard summary counts")
    public ApiResponse<DashboardSummaryDto> summary() {
        return ApiResponse.ok(adminDashboardService.getSummary());
    }

    @GetMapping("/leads-by-status")
    @Operation(summary = "CRM lead counts grouped by status")
    public ApiResponse<LeadsByStatusDto> leadsByStatus() {
        return ApiResponse.ok(adminDashboardService.getLeadsByStatus());
    }
}
