package com.gamyacouture.crm.infrastructure.mapper;

import com.gamyacouture.crm.api.dto.CustomerInterestDto;
import com.gamyacouture.crm.api.dto.InterestProductSummaryDto;
import com.gamyacouture.crm.domain.CustomerInterest;
import com.gamyacouture.product.domain.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CustomerInterestMapper {

    @Mapping(target = "product", source = "product")
    CustomerInterestDto toDto(CustomerInterest interest);

    InterestProductSummaryDto toProductSummary(Product product);
}
