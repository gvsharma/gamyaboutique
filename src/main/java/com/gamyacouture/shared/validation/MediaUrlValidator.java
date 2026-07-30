package com.gamyacouture.shared.validation;

import com.gamyacouture.shared.exception.BusinessException;
import com.gamyacouture.shared.exception.ErrorCode;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;

public final class MediaUrlValidator {

    private static final List<String> ALLOWED_HOST_SUFFIXES = List.of(
            "amazonaws.com",
            "cloudfront.net",
            "images.unsplash.com"
    );

    private MediaUrlValidator() {
    }

    public static void validate(String url) {
        if (url == null || url.isBlank()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Media URL is required");
        }
        String trimmed = url.trim();
        if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
            validateSiteRelativePath(trimmed);
            return;
        }
        validateHttpsUrl(trimmed);
    }

    private static void validateSiteRelativePath(String path) {
        if (path.contains("://") || path.contains("..")) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Invalid media URL");
        }
    }

    private static void validateHttpsUrl(String url) {
        URI uri;
        try {
            uri = new URI(url);
        } catch (URISyntaxException ex) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Invalid media URL");
        }
        if (!"https".equalsIgnoreCase(uri.getScheme())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Media URL must use HTTPS");
        }
        String host = uri.getHost();
        if (host == null || ALLOWED_HOST_SUFFIXES.stream().noneMatch(host::endsWith)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                    "Media URL host must be S3 (amazonaws.com) or approved CDN");
        }
    }
}
