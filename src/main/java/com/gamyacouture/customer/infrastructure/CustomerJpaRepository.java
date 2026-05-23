package com.gamyacouture.customer.infrastructure;

import com.gamyacouture.customer.domain.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CustomerJpaRepository extends JpaRepository<Customer, UUID> {

    Optional<Customer> findByUserId(UUID userId);

    Optional<Customer> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);
}
