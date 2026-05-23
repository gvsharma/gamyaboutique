package com.gamyacouture.customer.api;

import java.util.UUID;

public interface CustomerRegistrationApi {

    UUID registerForUser(UUID userId, String email, String firstName, String lastName, String phone);
}
