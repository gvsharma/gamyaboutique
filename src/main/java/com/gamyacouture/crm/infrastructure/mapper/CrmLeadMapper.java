package com.gamyacouture.crm.infrastructure.mapper;

import com.gamyacouture.crm.api.dto.CrmLeadDto;
import com.gamyacouture.crm.api.dto.CreateLeadRequest;
import com.gamyacouture.crm.domain.CrmLead;
import com.gamyacouture.crm.domain.LeadSource;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.UUID;

@Mapper(componentModel = "spring", imports = {UUID.class, LeadSource.class})
public interface CrmLeadMapper {

    CrmLeadDto toDto(CrmLead lead);

    @Mapping(target = "id", expression = "java(UUID.randomUUID())")
    @Mapping(target = "status", constant = "NEW")
    @Mapping(target = "source", expression = "java(request.source() != null ? request.source() : LeadSource.WEBSITE)")
    CrmLead toEntity(CreateLeadRequest request);
}
