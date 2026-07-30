package com.gamyacouture.crm.api.web;

import com.gamyacouture.crm.api.dto.CreateLeadRequest;
import com.gamyacouture.crm.api.dto.CrmLeadDto;
import com.gamyacouture.crm.api.dto.UpdateLeadStatusRequest;
import com.gamyacouture.crm.api.dto.UpdateStylistNotesRequest;
import com.gamyacouture.crm.application.LeadManagementService;
import com.gamyacouture.shared.web.ApiResponse;
import com.gamyacouture.shared.web.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

import static com.gamyacouture.shared.config.OpenApiConfig.BEARER_AUTH;

@RestController
@RequestMapping("/api/v1/crm/leads")
@RequiredArgsConstructor
@Tag(name = "CRM")
@SecurityRequirement(name = BEARER_AUTH)
public class CrmLeadController {

    private final LeadManagementService leadManagementService;

    @GetMapping
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "List CRM leads")
    public ApiResponse<PageResponse<CrmLeadDto>> list(
            @PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.ok(PageResponse.from(leadManagementService.listLeads(pageable)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Get a CRM lead by id")
    public ApiResponse<CrmLeadDto> getById(@PathVariable UUID id) {
        return ApiResponse.ok(leadManagementService.getLead(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Create a CRM lead")
    public ApiResponse<CrmLeadDto> create(@Valid @RequestBody CreateLeadRequest request) {
        return ApiResponse.ok(leadManagementService.createLead(request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Update CRM lead status")
    public ApiResponse<CrmLeadDto> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateLeadStatusRequest request) {
        return ApiResponse.ok(leadManagementService.updateStatus(id, request));
    }

    @PatchMapping("/{id}/stylist-notes")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Update internal stylist notes on a lead")
    public ApiResponse<CrmLeadDto> updateStylistNotes(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateStylistNotesRequest request) {
        return ApiResponse.ok(leadManagementService.updateStylistNotes(id, request.stylistNotes()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a CRM lead")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        leadManagementService.deleteLead(id);
        return ApiResponse.ok(null);
    }
}
