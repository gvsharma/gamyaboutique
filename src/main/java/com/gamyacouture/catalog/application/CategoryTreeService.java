package com.gamyacouture.catalog.application;

import com.gamyacouture.catalog.api.dto.CategoryTreeNodeDto;
import com.gamyacouture.catalog.infrastructure.CategoryJpaRepository;
import com.gamyacouture.product.config.ProductCacheNames;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryTreeService {

    private final CategoryJpaRepository categoryRepository;
    private final CategoryTreeBuilder categoryTreeBuilder;

    @Cacheable(value = ProductCacheNames.CATEGORY_TREE)
    public List<CategoryTreeNodeDto> getCategoryTree() {
        return categoryTreeBuilder.build(categoryRepository.findByActiveTrueOrderByDisplayOrderAscNameAsc());
    }
}
