package com.gamyacouture.site.api.dto;

import com.gamyacouture.catalog.api.dto.CollectionDto;
import com.gamyacouture.product.api.dto.ProductSummaryDto;

import java.util.List;

public record HomepageDto(
        HomepageSlotDto featuredCollectionSlot,
        CollectionDto featuredCollection,
        HomepageSlotDto curatedEditSlot,
        List<ProductSummaryDto> curatedProducts) {
}
