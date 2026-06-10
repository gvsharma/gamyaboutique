package com.gamyacouture.shared.validation;

import com.gamyacouture.shared.exception.BusinessException;
import com.gamyacouture.shared.exception.ErrorCode;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;

public final class ImageUrlValidator {

    private static final List<String> ALLOWED_HOST_SUFFIXES = List.of(
            "amazonaws.com",
            "cloudfront.net",
            "images.unsplash.com"
    );

    private ImageUrlValidator() {
    }

    public static void validate(String url) {
        if (url == null || url.isBlank()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Image URL is required");
        }
        URI uri;
        try {
            uri = new URI(url.trim());
        } catch (URISyntaxException ex) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Invalid image URL");
        }
        if (!"https".equalsIgnoreCase(uri.getScheme())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Image URL must use HTTPS");
        }
        String host = uri.getHost();
        if (host == null || ALLOWED_HOST_SUFFIXES.stream().noneMatch(host::endsWith)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                    "Image URL host must be S3 (amazonaws.com) or approved CDN");
        }
    }
}
