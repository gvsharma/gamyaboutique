package com.gamyacouture.crm.api.web;

import com.gamyacouture.crm.api.dto.CreateInterestRequest;
import com.gamyacouture.crm.api.dto.InterestCreatedResponse;
import com.gamyacouture.crm.application.CustomerInterestService;
import com.gamyacouture.shared.web.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/interests")
@RequiredArgsConstructor
@Tag(name = "Interests", description = "Customer product interest submissions")
public class InterestController {

    private final CustomerInterestService customerInterestService;

    @PostMapping
    @Operation(summary = "Submit interest in a product")
    public ApiResponse<InterestCreatedResponse> create(@Valid @RequestBody CreateInterestRequest request) {
        return ApiResponse.ok(customerInterestService.create(request));
    }
}
