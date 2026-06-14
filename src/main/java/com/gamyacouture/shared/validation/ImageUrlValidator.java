package com.gamyacouture.shared.validation;

public final class ImageUrlValidator {

    private ImageUrlValidator() {
    }

    public static void validate(String url) {
        MediaUrlValidator.validate(url);
    }
}
