package com.gamyacouture.site.domain;

public enum HomepageSlotKey {
    FEATURED_COLLECTION,
    CURATED_EDIT;

    public static HomepageSlotKey fromString(String key) {
        if (key == null || key.isBlank()) {
            throw new IllegalArgumentException("Slot key is required");
        }
        return HomepageSlotKey.valueOf(key.trim().toUpperCase());
    }
}
