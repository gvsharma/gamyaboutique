package com.gamyacouture.site.domain;

import java.util.Locale;

public enum PolicyKey {
    PRIVACY,
    SHIPPING,
    RETURN,
    TERMS;

    public static PolicyKey fromPath(String key) {
        if (key == null || key.isBlank()) {
            throw new IllegalArgumentException("Policy key is required");
        }
        String normalized = key.trim().toUpperCase(Locale.ROOT);
        if ("RETURNS".equals(normalized)) {
            normalized = "RETURN";
        }
        return PolicyKey.valueOf(normalized);
    }

    public String toPathSegment() {
        return name().toLowerCase(Locale.ROOT);
    }
}
