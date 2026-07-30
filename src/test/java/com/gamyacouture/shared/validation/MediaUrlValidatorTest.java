package com.gamyacouture.shared.validation;

import com.gamyacouture.shared.exception.BusinessException;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class MediaUrlValidatorTest {

    @Test
    void acceptsSiteRelativeStaticPaths() {
        assertDoesNotThrow(() -> MediaUrlValidator.validate("/brand/category-saree.jpg"));
        assertDoesNotThrow(() -> MediaUrlValidator.validate("/uploads/product/abc.jpg"));
    }

    @Test
    void rejectsUnsafeRelativePaths() {
        assertThrows(BusinessException.class, () -> MediaUrlValidator.validate("/../etc/passwd"));
        assertThrows(BusinessException.class, () -> MediaUrlValidator.validate("//evil.com/image.jpg"));
    }

    @Test
    void acceptsApprovedHttpsUrls() {
        assertDoesNotThrow(() -> MediaUrlValidator.validate(
                "https://images.unsplash.com/photo-1610030469983-98e550b19538?w=800"));
    }

    @Test
    void rejectsHttpUrls() {
        assertThrows(BusinessException.class, () -> MediaUrlValidator.validate("http://images.unsplash.com/a.jpg"));
    }
}
