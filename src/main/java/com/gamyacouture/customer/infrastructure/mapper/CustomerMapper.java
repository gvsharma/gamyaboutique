package com.gamyacouture.customer.infrastructure.mapper;

import com.gamyacouture.customer.api.dto.CustomerProfileDto;
import com.gamyacouture.customer.domain.Customer;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CustomerMapper {

    CustomerProfileDto toProfileDto(Customer customer);
}
