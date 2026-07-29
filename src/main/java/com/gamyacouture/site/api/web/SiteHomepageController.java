package com.gamyacouture.site.api.web;

import com.gamyacouture.shared.web.ApiResponse;
import com.gamyacouture.site.api.dto.HomepageDto;
import com.gamyacouture.site.application.HomepageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/site")
@RequiredArgsConstructor
public class SiteHomepageController {

    private final HomepageService homepageService;

    @GetMapping("/homepage")
    public ApiResponse<HomepageDto> homepage() {
        return ApiResponse.ok(homepageService.getPublicHomepage());
    }
}
