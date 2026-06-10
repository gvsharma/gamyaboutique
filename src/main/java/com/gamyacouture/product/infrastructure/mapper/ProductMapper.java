package com.gamyacouture.product.infrastructure.mapper;

import com.gamyacouture.catalog.domain.Category;
import com.gamyacouture.catalog.domain.Fabric;
import com.gamyacouture.catalog.domain.Offer;
import com.gamyacouture.catalog.domain.Print;
import com.gamyacouture.catalog.domain.Tag;
import com.gamyacouture.product.api.dto.CategorySummaryDto;
import com.gamyacouture.product.api.dto.FabricDto;
import com.gamyacouture.product.api.dto.OfferSummaryDto;
import com.gamyacouture.product.api.dto.PrintDto;
import com.gamyacouture.product.api.dto.ProductDetailDto;
import com.gamyacouture.product.api.dto.ProductImageDto;
import com.gamyacouture.product.api.dto.ProductSummaryDto;
import com.gamyacouture.product.api.dto.TagDto;
import com.gamyacouture.product.application.ProductPricingCalculator;
import com.gamyacouture.product.domain.Product;
import com.gamyacouture.product.domain.ProductImage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.Comparator;
import java.util.List;
import java.util.Set;

@Mapper(componentModel = "spring", uses = ProductPricingCalculator.class)
public interface ProductMapper {

    FabricDto toFabricDto(Fabric fabric);

    PrintDto toPrintDto(Print print);

    TagDto toTagDto(Tag tag);

    OfferSummaryDto toOfferDto(Offer offer);

    CategorySummaryDto toCategorySummary(Category category);

    ProductImageDto toImageDto(ProductImage image);

    @Mapping(target = "primaryImageUrl", expression = "java(primaryImageUrl(product))")
    @Mapping(target = "tags", expression = "java(mapTags(product.getTags()))")
    @Mapping(target = "effectivePrice", source = "product", qualifiedByName = "effectivePrice")
    @Mapping(target = "onOffer", source = "product", qualifiedByName = "onOffer")
    ProductSummaryDto toSummary(Product product);

    @Mapping(target = "images", source = "product.images")
    @Mapping(target = "primaryCategoryId", source = "product.primaryCategory.id")
    @Mapping(target = "tags", expression = "java(mapTags(product.getTags()))")
    @Mapping(target = "categories", source = "categories")
    @Mapping(target = "effectivePrice", source = "product", qualifiedByName = "effectivePrice")
    @Mapping(target = "onOffer", source = "product", qualifiedByName = "onOffer")
    @Mapping(target = "stockQuantity", source = "product.stockQuantity")
    @Mapping(target = "lowStockThreshold", source = "product.lowStockThreshold")
    @Mapping(target = "lowStock", expression = "java(isLowStock(product))")
    ProductDetailDto toDetail(Product product, List<CategorySummaryDto> categories);

    default List<TagDto> mapTags(Set<Tag> tags) {
        if (tags == null || tags.isEmpty()) {
            return List.of();
        }
        return tags.stream()
                .map(this::toTagDto)
                .sorted(Comparator.comparing(TagDto::name))
                .toList();
    }

    default String primaryImageUrl(Product product) {
        if (product.getImages() == null || product.getImages().isEmpty()) {
            return null;
        }
        return product.getImages().stream()
                .min(Comparator.comparingInt(ProductImage::getDisplayOrder))
                .map(ProductImage::getUrl)
                .orElse(null);
    }

    default boolean isLowStock(Product product) {
        if (product.getStockQuantity() == null) {
            return false;
        }
        int threshold = product.getLowStockThreshold() != null ? product.getLowStockThreshold() : 5;
        return product.getStockQuantity() <= threshold;
    }
}
