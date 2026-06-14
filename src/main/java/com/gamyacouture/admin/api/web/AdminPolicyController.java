package com.gamyacouture.admin.api.web;

import com.gamyacouture.shared.web.ApiResponse;
import com.gamyacouture.site.api.dto.SitePolicyDto;
import com.gamyacouture.site.api.dto.UpdateSitePolicyRequest;
import com.gamyacouture.site.application.SitePolicyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import static com.gamyacouture.shared.config.OpenApiConfig.BEARER_AUTH;

@RestController
@RequestMapping("/api/v1/admin/policies")
@RequiredArgsConstructor
@Validated
@Tag(name = "Admin Policies")
@SecurityRequirement(name = BEARER_AUTH)
@PreAuthorize("hasRole('ADMIN')")
public class AdminPolicyController {

    private final SitePolicyService sitePolicyService;

    @GetMapping
    @Operation(summary = "List all site policies")
    public ApiResponse<List<SitePolicyDto>> listPolicies() {
        return ApiResponse.ok(sitePolicyService.listAll());
    }

    @GetMapping("/{key}")
    @Operation(summary = "Get a site policy by key")
    public ApiResponse<SitePolicyDto> getPolicy(@PathVariable String key) {
        return ApiResponse.ok(sitePolicyService.getByKey(key));
    }

    @PutMapping("/{key}")
    @Operation(summary = "Update a site policy")
    public ApiResponse<SitePolicyDto> updatePolicy(
            @PathVariable String key,
            @Valid @RequestBody UpdateSitePolicyRequest request) {
        return ApiResponse.ok(sitePolicyService.update(key, request), "Policy updated");
    }
}
