package com.gamyacouture.product.domain;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class ProductCategoryLinkId implements Serializable {

    private UUID productId;
    private UUID categoryId;
}
