package com.gamyacouture.product.application;

import com.gamyacouture.catalog.domain.DiscountType;
import com.gamyacouture.catalog.domain.Offer;
import com.gamyacouture.product.domain.Product;
import org.mapstruct.Named;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;

@Component
public class ProductPricingCalculator {

    public BigDecimal effectivePrice(Product product) {
        BigDecimal listPrice = product.getPrice();
        if (hasActiveOffer(product)) {
            return applyOffer(listPrice, product.getOffer());
        }
        if (product.getCompareAtPrice() != null
                && product.getCompareAtPrice().compareTo(listPrice) < 0) {
            return product.getCompareAtPrice();
        }
        return listPrice;
    }

    @Named("onOffer")
    public boolean onOffer(Product product) {
        return hasActiveOffer(product)
                || (product.getCompareAtPrice() != null
                        && product.getCompareAtPrice().compareTo(product.getPrice()) < 0);
    }

    @Named("effectivePrice")
    public BigDecimal effectivePriceNamed(Product product) {
        return effectivePrice(product);
    }

    private boolean hasActiveOffer(Product product) {
        Offer offer = product.getOffer();
        if (offer == null || !offer.isActive()) {
            return false;
        }
        Instant now = Instant.now();
        if (offer.getStartsAt() != null && offer.getStartsAt().isAfter(now)) {
            return false;
        }
        return offer.getEndsAt() == null || !offer.getEndsAt().isBefore(now);
    }

    private BigDecimal applyOffer(BigDecimal listPrice, Offer offer) {
        BigDecimal discounted = switch (offer.getDiscountType()) {
            case PERCENT -> listPrice.subtract(
                    listPrice.multiply(offer.getDiscountValue())
                            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP));
            case FIXED -> listPrice.subtract(offer.getDiscountValue());
        };
        return discounted.max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
    }
}
