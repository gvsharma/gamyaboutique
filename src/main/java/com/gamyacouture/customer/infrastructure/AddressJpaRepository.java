package com.gamyacouture.customer.infrastructure;

import com.gamyacouture.customer.domain.Address;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AddressJpaRepository extends JpaRepository<Address, UUID> {

    List<Address> findByCustomerIdAndDeletedAtIsNullOrderByIsDefaultDescCreatedAtAsc(UUID customerId);
}
