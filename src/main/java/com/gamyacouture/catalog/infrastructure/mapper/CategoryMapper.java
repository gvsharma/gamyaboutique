package com.gamyacouture.catalog.infrastructure.mapper;

import com.gamyacouture.catalog.api.dto.CategoryDto;
import com.gamyacouture.catalog.domain.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    @Mapping(target = "parentId", source = "parent.id")
    CategoryDto toDto(Category category);
}
