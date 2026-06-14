package com.gamyacouture.catalog.application;

import org.springframework.util.StringUtils;

/**
 * Default cover / product placeholder URLs (Unsplash) keyed by category slug patterns.
 */
public final class CategoryImages {

    private static final String DEFAULT =
            "https://images.unsplash.com/photo-1583391734527-658aeeef0f35?w=1200&q=80";

    private CategoryImages() {
    }

    public static String coverForSlug(String slug) {
        if (!StringUtils.hasText(slug)) {
            return DEFAULT;
        }
        String s = slug.toLowerCase();
        if (s.contains("saree")) {
            return "https://images.unsplash.com/photo-1610030469983-98e550b19538?w=1200&q=80";
        }
        if (s.contains("lehenga") || "bridal".equals(s)) {
            return "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1200&q=80";
        }
        if (s.contains("kurt")) {
            return "https://images.unsplash.com/photo-1617627143750-d86bc21e3273?w=1200&q=80";
        }
        if (s.contains("blouse")) {
            return "https://images.unsplash.com/photo-1572804013309-59a23b2e4c1f?w=1200&q=80";
        }
        if (s.contains("frock") || s.contains("girl") || s.contains("kid") || s.contains("birthday")) {
            return "https://images.unsplash.com/photo-1515488042361-ee00e8170dc8?w=1200&q=80";
        }
        if (s.contains("sherwani") || "men".equals(s)) {
            return "https://images.unsplash.com/photo-1620799140408-8747d1d90e59?w=1200&q=80";
        }
        return DEFAULT;
    }

    public static String productForSlug(String slug) {
        return coverForSlug(slug).replace("w=1200", "w=800");
    }

    public static String productForName(String productName) {
        if (!StringUtils.hasText(productName)) {
            return productForSlug(null);
        }
        String n = productName.toLowerCase();
        if (n.contains("saree")) {
            return productForSlug("sarees");
        }
        if (n.contains("lehenga")) {
            return productForSlug("lehengas");
        }
        if (n.contains("kurta") || n.contains("kurti")) {
            return productForSlug("kurtas");
        }
        if (n.contains("blouse")) {
            return productForSlug("blouses");
        }
        if (n.contains("frock") || n.contains("girl") || n.contains("kid")) {
            return productForSlug("frocks");
        }
        if (n.contains("sherwani")) {
            return productForSlug("sherwanis");
        }
        return productForSlug(null);
    }
}
