package com.gamyacouture.shared.web;

import java.time.Instant;
import java.util.Collections;
import java.util.List;

public record ApiResponse<T>(
        boolean success,
        String message,
        T data,
        Instant timestamp,
        String path,
        List<ApiFieldError> errors
) {

    public static <T> ApiResponse<T> ok(T data) {
        return ok(data, null, null);
    }

    public static <T> ApiResponse<T> ok(T data, String message) {
        return ok(data, message, null);
    }

    public static <T> ApiResponse<T> ok(T data, String message, String path) {
        return new ApiResponse<>(true, message, data, Instant.now(), path, null);
    }

    public static <T> ApiResponse<T> fail(String message, String path, List<ApiFieldError> errors) {
        return new ApiResponse<>(false, message, null, Instant.now(), path,
                errors == null ? null : List.copyOf(errors));
    }

    public static <T> ApiResponse<T> fail(String message, String path) {
        return fail(message, path, Collections.emptyList());
    }
}
