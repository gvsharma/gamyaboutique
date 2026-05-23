package com.gamyacouture.customer.api.web;

import com.gamyacouture.customer.api.CustomerQueryApi;
import com.gamyacouture.customer.api.dto.CustomerProfileDto;
import com.gamyacouture.shared.web.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static com.gamyacouture.shared.config.OpenApiConfig.BEARER_AUTH;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
@Tag(name = "Customer")
public class CustomerController {

    private final CustomerQueryApi customerQueryApi;

    @GetMapping("/me")
    @Operation(summary = "Get the authenticated customer's profile")
    @SecurityRequirement(name = BEARER_AUTH)
    public ApiResponse<CustomerProfileDto> me() {
        return ApiResponse.ok(customerQueryApi.getCurrentCustomerProfile());
    }
}
