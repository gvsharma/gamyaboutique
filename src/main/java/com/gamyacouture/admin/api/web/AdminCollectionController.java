package com.gamyacouture.admin.api.web;

import com.gamyacouture.admin.api.dto.AdminCollectionDto;
import com.gamyacouture.admin.api.dto.UpsertCollectionRequest;
import com.gamyacouture.admin.application.AdminCollectionService;
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
@RequestMapping("/api/v1/admin/collections")
@RequiredArgsConstructor
@Validated
@Tag(name = "Admin Collections")
@SecurityRequirement(name = BEARER_AUTH)
@PreAuthorize("hasRole('ADMIN')")
public class AdminCollectionController {

    private final AdminCollectionService adminCollectionService;

    @GetMapping
    @Operation(summary = "List all merchandising collections")
    public ApiResponse<List<AdminCollectionDto>> list() {
        return ApiResponse.ok(adminCollectionService.listAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a collection by id")
    public ApiResponse<AdminCollectionDto> getById(@PathVariable UUID id) {
        return ApiResponse.ok(adminCollectionService.getById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a collection")
    public ApiResponse<AdminCollectionDto> create(@Valid @RequestBody UpsertCollectionRequest request) {
        return ApiResponse.ok(adminCollectionService.create(request), "Collection created");
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a collection")
    public ApiResponse<AdminCollectionDto> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpsertCollectionRequest request) {
        return ApiResponse.ok(adminCollectionService.update(id, request), "Collection updated");
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Deactivate a collection")
    public void deactivate(@PathVariable UUID id) {
        adminCollectionService.deactivate(id);
    }
}
