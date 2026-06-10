package com.gamyacouture.shared.util;

public final class PhoneNormalizer {

    private PhoneNormalizer() {
    }

    public static String normalize(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        String digits = raw.replaceAll("[^0-9+]", "");
        if (digits.startsWith("+")) {
            return digits;
        }
        if (digits.length() == 10) {
            return "+91" + digits;
        }
        if (digits.startsWith("91") && digits.length() == 12) {
            return "+" + digits;
        }
        return "+" + digits;
    }

    public static boolean looksLikePhone(String value) {
        if (value == null || value.isBlank()) {
            return false;
        }
        String stripped = value.replaceAll("[^0-9+]", "");
        return stripped.startsWith("+") || stripped.matches("\\d{10,15}");
    }
}
