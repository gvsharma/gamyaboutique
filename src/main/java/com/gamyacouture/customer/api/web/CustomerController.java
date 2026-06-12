package com.gamyacouture.customer.api.web;

import com.gamyacouture.customer.api.dto.AddressDto;
import com.gamyacouture.customer.api.dto.ChangePasswordRequest;
import com.gamyacouture.customer.api.dto.CustomerProfileDto;
import com.gamyacouture.customer.api.dto.UpdateCustomerProfileRequest;
import com.gamyacouture.customer.api.dto.UpsertAddressRequest;
import com.gamyacouture.customer.application.CustomerProfileService;
import com.gamyacouture.product.api.dto.ProductSummaryDto;
import com.gamyacouture.product.application.ProductEngagementService;
import com.gamyacouture.shared.web.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
@Tag(name = "Customer")
@SecurityRequirement(name = BEARER_AUTH)
public class CustomerController {

    private final CustomerProfileService customerProfileService;
    private final ProductEngagementService productEngagementService;

    @GetMapping("/me")
    @Operation(summary = "Get the authenticated customer's profile")
    public ApiResponse<CustomerProfileDto> me() {
        return ApiResponse.ok(customerProfileService.getProfile());
    }

    @PutMapping("/me")
    @Operation(summary = "Update customer profile")
    public ApiResponse<CustomerProfileDto> updateProfile(@Valid @RequestBody UpdateCustomerProfileRequest request) {
        return ApiResponse.ok(customerProfileService.updateProfile(request), "Profile updated");
    }

    @PutMapping("/me/password")
    @Operation(summary = "Change password")
    public ApiResponse<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        customerProfileService.changePassword(request);
        return ApiResponse.ok(null, "Password updated");
    }

    @GetMapping("/me/addresses")
    @Operation(summary = "List customer addresses")
    public ApiResponse<List<AddressDto>> listAddresses() {
        return ApiResponse.ok(customerProfileService.listAddresses());
    }

    @PostMapping("/me/addresses")
    @Operation(summary = "Add address")
    public ApiResponse<AddressDto> addAddress(@Valid @RequestBody UpsertAddressRequest request) {
        return ApiResponse.ok(customerProfileService.addAddress(request), "Address added");
    }

    @PutMapping("/me/addresses/{id}")
    @Operation(summary = "Update address")
    public ApiResponse<AddressDto> updateAddress(
            @PathVariable UUID id,
            @Valid @RequestBody UpsertAddressRequest request) {
        return ApiResponse.ok(customerProfileService.updateAddress(id, request), "Address updated");
    }

    @DeleteMapping("/me/addresses/{id}")
    @Operation(summary = "Delete address")
    public ApiResponse<Void> deleteAddress(@PathVariable UUID id) {
        customerProfileService.deleteAddress(id);
        return ApiResponse.ok(null, "Address deleted");
    }

    @GetMapping("/me/recently-viewed")
    @Operation(summary = "Recently viewed products")
    public ApiResponse<List<ProductSummaryDto>> recentlyViewed() {
        return ApiResponse.ok(productEngagementService.recentlyViewed());
    }
}
