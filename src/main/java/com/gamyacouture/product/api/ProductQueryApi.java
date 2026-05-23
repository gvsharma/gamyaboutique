package com.gamyacouture.product.api;

import com.gamyacouture.product.api.dto.ProductDetailDto;
import com.gamyacouture.product.api.dto.ProductSummaryDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ProductQueryApi {

    ProductDetailDto findById(UUID id);

    Page<ProductSummaryDto> findByCategory(UUID categoryId, Pageable pageable);

    Page<ProductSummaryDto> findActive(Pageable pageable);
}
