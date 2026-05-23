package com.gamyacouture.product.api.dto;

import java.util.UUID;

public record TagDto(UUID id, String name, String slug) {
}
