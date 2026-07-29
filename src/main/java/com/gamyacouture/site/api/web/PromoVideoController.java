package com.gamyacouture.site.api.web;

import com.gamyacouture.shared.web.ApiResponse;
import com.gamyacouture.site.api.dto.PromoVideoDto;
import com.gamyacouture.site.application.PromoVideoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/promo-videos")
@RequiredArgsConstructor
@Tag(name = "Promo Videos")
public class PromoVideoController {

    private final PromoVideoService promoVideoService;

    @GetMapping
    @Operation(summary = "List active homepage promo videos")
    public ApiResponse<List<PromoVideoDto>> listActive() {
        return ApiResponse.ok(promoVideoService.listActive());
    }
}
