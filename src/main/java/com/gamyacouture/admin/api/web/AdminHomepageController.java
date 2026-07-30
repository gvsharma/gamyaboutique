package com.gamyacouture.admin.api.web;

import com.gamyacouture.shared.web.ApiResponse;
import com.gamyacouture.site.api.dto.HomepageSlotDto;
import com.gamyacouture.site.api.dto.UpsertHomepageSlotRequest;
import com.gamyacouture.site.application.HomepageService;
import com.gamyacouture.site.domain.HomepageSlotKey;
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
@RequestMapping("/api/v1/admin/homepage")
@RequiredArgsConstructor
@Validated
@Tag(name = "Admin Homepage")
@SecurityRequirement(name = BEARER_AUTH)
@PreAuthorize("hasRole('ADMIN')")
public class AdminHomepageController {

    private final HomepageService homepageService;

    @GetMapping("/slots")
    @Operation(summary = "List homepage merchandising slots")
    public ApiResponse<List<HomepageSlotDto>> listSlots() {
        return ApiResponse.ok(homepageService.listSlots());
    }

    @PutMapping("/slots/{key}")
    @Operation(summary = "Update a homepage merchandising slot")
    public ApiResponse<HomepageSlotDto> upsertSlot(
            @PathVariable String key,
            @Valid @RequestBody UpsertHomepageSlotRequest request) {
        HomepageSlotKey slotKey = HomepageSlotKey.fromString(key);
        return ApiResponse.ok(homepageService.upsertSlot(slotKey, request), "Homepage slot updated");
    }
}
