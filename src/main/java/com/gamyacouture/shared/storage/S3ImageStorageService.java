package com.gamyacouture.shared.storage;

import com.gamyacouture.shared.config.S3StorageProperties;
import com.gamyacouture.shared.exception.BusinessException;
import com.gamyacouture.shared.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.storage.s3.enabled", havingValue = "true")
public class S3ImageStorageService implements ImageStorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    private final S3Client s3Client;
    private final S3StorageProperties properties;

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public String upload(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Image file is required");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                    "Unsupported image type. Allowed: JPEG, PNG, WebP, GIF");
        }
        if (!StringUtils.hasText(properties.bucket())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "S3 bucket is not configured");
        }

        String safeFolder = sanitizeFolder(folder);
        String extension = extensionFor(contentType);
        String key = objectKey(properties.keyPrefix(), safeFolder, UUID.randomUUID() + extension);

        try {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(properties.bucket())
                    .key(key)
                    .contentType(contentType)
                    .build();
            s3Client.putObject(request, RequestBody.fromBytes(file.getBytes()));
        } catch (IOException ex) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "Failed to read uploaded image");
        }

        return publicUrl(key);
    }

    private String publicUrl(String key) {
        if (StringUtils.hasText(properties.publicBaseUrl())) {
            String base = properties.publicBaseUrl().replaceAll("/$", "");
            return base + "/" + key;
        }
        return "https://" + properties.bucket() + ".s3." + properties.region() + ".amazonaws.com/" + key;
    }

    private static String objectKey(String keyPrefix, String folder, String fileName) {
        String prefix = StringUtils.hasText(keyPrefix) ? keyPrefix : "";
        if (!prefix.isEmpty() && !prefix.endsWith("/")) {
            prefix = prefix + "/";
        }
        if (!StringUtils.hasText(folder)) {
            return prefix + fileName;
        }
        String prefixStem = prefix.replaceAll("/$", "");
        if (prefixStem.endsWith("/" + folder) || prefixStem.equals(folder)) {
            return prefix + fileName;
        }
        return prefix + folder + "/" + fileName;
    }

    private static String sanitizeFolder(String folder) {
        String value = StringUtils.hasText(folder) ? folder : "misc";
        return value.replaceAll("[^a-zA-Z0-9/_-]", "").replaceAll("/+", "/");
    }

    private static String extensionFor(String contentType) {
        return switch (contentType.toLowerCase(Locale.ROOT)) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> ".jpg";
        };
    }
}
