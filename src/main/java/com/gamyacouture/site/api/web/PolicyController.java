package com.gamyacouture.site.api.web;

import com.gamyacouture.shared.web.ApiResponse;
import com.gamyacouture.site.api.dto.SitePolicyDto;
import com.gamyacouture.site.application.SitePolicyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Policies", description = "Public site policy content")
@RestController
@RequestMapping("/api/v1/policies")
@RequiredArgsConstructor
public class PolicyController {

    private final SitePolicyService sitePolicyService;

    @Operation(summary = "Get a site policy by key (privacy, shipping, return)")
    @GetMapping("/{key}")
    public ApiResponse<SitePolicyDto> getPolicy(@PathVariable String key) {
        return ApiResponse.ok(sitePolicyService.getByKey(key));
    }
}
