package com.gamyacouture.customer.infrastructure.mapper;

import com.gamyacouture.customer.api.dto.AddressDto;
import com.gamyacouture.customer.api.dto.CustomerProfileDto;
import com.gamyacouture.customer.domain.Address;
import com.gamyacouture.customer.domain.Customer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CustomerMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "addresses", source = "addresses")
    CustomerProfileDto toProfileDto(Customer customer);

    AddressDto toAddressDto(Address address);
}
