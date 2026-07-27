package com.gamyacouture.product.application;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gamyacouture.product.api.dto.ProductColorDto;
import lombok.experimental.UtilityClass;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@UtilityClass
public class ProductOptionsCodec {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    public static String encodeSizes(List<String> sizes) {
        if (sizes == null || sizes.isEmpty()) {
            return null;
        }
        return sizes.stream()
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .distinct()
                .collect(Collectors.joining(","));
    }

    public static List<String> decodeSizes(String raw) {
        if (raw == null || raw.isBlank()) {
            return List.of();
        }
        return Arrays.stream(raw.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toList();
    }

    public static String encodeColors(List<ProductColorDto> colors) {
        if (colors == null || colors.isEmpty()) {
            return null;
        }
        try {
            return MAPPER.writeValueAsString(colors);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Invalid color options", e);
        }
    }

    public static List<ProductColorDto> decodeColors(String raw) {
        if (raw == null || raw.isBlank()) {
            return List.of();
        }
        try {
            return MAPPER.readValue(raw, new TypeReference<List<ProductColorDto>>() {});
        } catch (JsonProcessingException e) {
            return Collections.emptyList();
        }
    }
}
