package com.gamyacouture.crm.api.web;

import com.gamyacouture.crm.api.dto.CustomerInterestDto;
import com.gamyacouture.crm.api.dto.InterestListFilter;
import com.gamyacouture.crm.api.dto.UpdateInterestStatusRequest;
import com.gamyacouture.crm.application.CustomerInterestService;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

import static com.gamyacouture.shared.config.OpenApiConfig.BEARER_AUTH;

@RestController
@RequestMapping("/api/v1/admin/interests")
@RequiredArgsConstructor
@Validated
@Tag(name = "Admin Interests", description = "CRM lead management for customer product interests")
@SecurityRequirement(name = BEARER_AUTH)
@PreAuthorize("hasRole('ADMIN')")
public class AdminInterestController {

    private final CustomerInterestService customerInterestService;

    @GetMapping
    @Operation(summary = "List customer interests with filters, pagination, and sorting")
    public ApiResponse<PageResponse<CustomerInterestDto>> list(
            @ModelAttribute @ParameterObject InterestListFilter filter,
            @ParameterObject
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ApiResponse.ok(PageResponse.from(customerInterestService.list(filter, pageable)));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update interest workflow status")
    public ApiResponse<CustomerInterestDto> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateInterestStatusRequest request) {
        return ApiResponse.ok(customerInterestService.updateStatus(id, request));
    }
}
