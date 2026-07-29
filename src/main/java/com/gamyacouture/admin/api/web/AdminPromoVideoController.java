package com.gamyacouture.admin.api.web;

import com.gamyacouture.shared.web.ApiResponse;
import com.gamyacouture.site.api.dto.PromoVideoDto;
import com.gamyacouture.site.api.dto.UpsertPromoVideoRequest;
import com.gamyacouture.site.application.PromoVideoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

import static com.gamyacouture.shared.config.OpenApiConfig.BEARER_AUTH;

@RestController
@RequestMapping("/api/v1/admin/promo-videos")
@RequiredArgsConstructor
@Validated
@Tag(name = "Admin Promo Videos")
@SecurityRequirement(name = BEARER_AUTH)
@PreAuthorize("hasRole('ADMIN')")
public class AdminPromoVideoController {

    private final PromoVideoService promoVideoService;

    @GetMapping
    @Operation(summary = "List all promo videos")
    public ApiResponse<List<PromoVideoDto>> list() {
        return ApiResponse.ok(promoVideoService.listAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a promo video by id")
    public ApiResponse<PromoVideoDto> getById(@PathVariable UUID id) {
        return ApiResponse.ok(promoVideoService.getById(id));
    }

    @PostMapping
    @Operation(summary = "Create a promo video")
    public ApiResponse<PromoVideoDto> create(@Valid @RequestBody UpsertPromoVideoRequest request) {
        return ApiResponse.ok(promoVideoService.create(request), "Promo video created");
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a promo video")
    public ApiResponse<PromoVideoDto> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpsertPromoVideoRequest request) {
        return ApiResponse.ok(promoVideoService.update(id, request), "Promo video updated");
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a promo video")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        promoVideoService.delete(id);
        return ApiResponse.ok(null, "Promo video deleted");
    }
}
