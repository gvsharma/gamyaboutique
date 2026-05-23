package com.gamyacouture.product.infrastructure.mapper;

import com.gamyacouture.product.api.dto.ProductDetailDto;
import com.gamyacouture.product.api.dto.ProductImageDto;
import com.gamyacouture.product.api.dto.ProductSummaryDto;
import com.gamyacouture.product.domain.Product;
import com.gamyacouture.product.domain.ProductImage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;
import java.util.UUID;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    ProductImageDto toImageDto(ProductImage image);

    List<ProductImageDto> toImageDtos(List<ProductImage> images);

    @Mapping(target = "primaryImageUrl", expression = "java(primaryImageUrl(product))")
    ProductSummaryDto toSummary(Product product);

    @Mapping(target = "images", source = "product.images")
    @Mapping(target = "categoryIds", source = "categoryIds")
    ProductDetailDto toDetail(Product product, List<UUID> categoryIds);

    default String primaryImageUrl(Product product) {
        if (product.getImages() == null || product.getImages().isEmpty()) {
            return null;
        }
        return product.getImages().getFirst().getUrl();
    }
}
