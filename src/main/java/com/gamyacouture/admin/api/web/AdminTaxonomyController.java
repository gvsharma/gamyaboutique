package com.gamyacouture.admin.api.web;

import com.gamyacouture.admin.api.dto.AdminFabricDto;
import com.gamyacouture.admin.api.dto.AdminOfferDto;
import com.gamyacouture.admin.api.dto.AdminPrintDto;
import com.gamyacouture.admin.api.dto.AdminTagDto;
import com.gamyacouture.admin.api.dto.TaxonomyOptionDto;
import com.gamyacouture.admin.api.dto.UpsertFabricRequest;
import com.gamyacouture.admin.api.dto.UpsertOfferRequest;
import com.gamyacouture.admin.api.dto.UpsertPrintRequest;
import com.gamyacouture.admin.api.dto.UpsertTagRequest;
import com.gamyacouture.admin.application.AdminTaxonomyService;
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
@RequestMapping("/api/v1/admin/taxonomy")
@RequiredArgsConstructor
@Validated
@Tag(name = "Admin Taxonomy")
@SecurityRequirement(name = BEARER_AUTH)
@PreAuthorize("hasRole('ADMIN')")
public class AdminTaxonomyController {

    private final AdminTaxonomyService adminTaxonomyService;

    @GetMapping("/fabrics")
    @Operation(summary = "List active fabrics for product forms")
    public ApiResponse<List<TaxonomyOptionDto>> fabrics() {
        return ApiResponse.ok(adminTaxonomyService.listFabrics());
    }

    @GetMapping("/prints")
    @Operation(summary = "List active prints for product forms")
    public ApiResponse<List<TaxonomyOptionDto>> prints() {
        return ApiResponse.ok(adminTaxonomyService.listPrints());
    }

    @GetMapping("/fabrics/all")
    @Operation(summary = "List all fabrics for admin management")
    public ApiResponse<List<AdminFabricDto>> allFabrics() {
        return ApiResponse.ok(adminTaxonomyService.listAllFabrics());
    }

    @PostMapping("/fabrics")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a fabric")
    public ApiResponse<AdminFabricDto> createFabric(@Valid @RequestBody UpsertFabricRequest request) {
        return ApiResponse.ok(adminTaxonomyService.createFabric(request), "Fabric created");
    }

    @PutMapping("/fabrics/{id}")
    @Operation(summary = "Update a fabric")
    public ApiResponse<AdminFabricDto> updateFabric(
            @PathVariable UUID id,
            @Valid @RequestBody UpsertFabricRequest request) {
        return ApiResponse.ok(adminTaxonomyService.updateFabric(id, request), "Fabric updated");
    }

    @DeleteMapping("/fabrics/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Deactivate a fabric")
    public void deactivateFabric(@PathVariable UUID id) {
        adminTaxonomyService.deactivateFabric(id);
    }

    @GetMapping("/prints/all")
    @Operation(summary = "List all prints for admin management")
    public ApiResponse<List<AdminPrintDto>> allPrints() {
        return ApiResponse.ok(adminTaxonomyService.listAllPrints());
    }

    @PostMapping("/prints")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a print")
    public ApiResponse<AdminPrintDto> createPrint(@Valid @RequestBody UpsertPrintRequest request) {
        return ApiResponse.ok(adminTaxonomyService.createPrint(request), "Print created");
    }

    @PutMapping("/prints/{id}")
    @Operation(summary = "Update a print")
    public ApiResponse<AdminPrintDto> updatePrint(
            @PathVariable UUID id,
            @Valid @RequestBody UpsertPrintRequest request) {
        return ApiResponse.ok(adminTaxonomyService.updatePrint(id, request), "Print updated");
    }

    @DeleteMapping("/prints/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Deactivate a print")
    public void deactivatePrint(@PathVariable UUID id) {
        adminTaxonomyService.deactivatePrint(id);
    }

    @GetMapping("/tags/all")
    @Operation(summary = "List all tags for admin management")
    public ApiResponse<List<AdminTagDto>> allTags() {
        return ApiResponse.ok(adminTaxonomyService.listAllTags());
    }

    @PostMapping("/tags")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a tag")
    public ApiResponse<AdminTagDto> createTag(@Valid @RequestBody UpsertTagRequest request) {
        return ApiResponse.ok(adminTaxonomyService.createTag(request), "Tag created");
    }

    @PutMapping("/tags/{id}")
    @Operation(summary = "Update a tag")
    public ApiResponse<AdminTagDto> updateTag(
            @PathVariable UUID id,
            @Valid @RequestBody UpsertTagRequest request) {
        return ApiResponse.ok(adminTaxonomyService.updateTag(id, request), "Tag updated");
    }

    @DeleteMapping("/tags/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Deactivate a tag")
    public void deactivateTag(@PathVariable UUID id) {
        adminTaxonomyService.deactivateTag(id);
    }

    @GetMapping("/offers/all")
    @Operation(summary = "List all offers for admin management")
    public ApiResponse<List<AdminOfferDto>> allOffers() {
        return ApiResponse.ok(adminTaxonomyService.listAllOffers());
    }

    @PostMapping("/offers")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create an offer")
    public ApiResponse<AdminOfferDto> createOffer(@Valid @RequestBody UpsertOfferRequest request) {
        return ApiResponse.ok(adminTaxonomyService.createOffer(request), "Offer created");
    }

    @PutMapping("/offers/{id}")
    @Operation(summary = "Update an offer")
    public ApiResponse<AdminOfferDto> updateOffer(
            @PathVariable UUID id,
            @Valid @RequestBody UpsertOfferRequest request) {
        return ApiResponse.ok(adminTaxonomyService.updateOffer(id, request), "Offer updated");
    }

    @DeleteMapping("/offers/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Deactivate an offer")
    public void deactivateOffer(@PathVariable UUID id) {
        adminTaxonomyService.deactivateOffer(id);
    }
}
