package com.gamyacouture.customer.api;

import com.gamyacouture.customer.api.dto.CustomerProfileDto;

import java.util.Optional;
import java.util.UUID;

public interface CustomerQueryApi {

    Optional<CustomerProfileDto> findByUserId(UUID userId);

    CustomerProfileDto getCurrentCustomerProfile();
}
