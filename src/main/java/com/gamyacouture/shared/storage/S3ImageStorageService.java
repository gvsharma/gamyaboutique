package com.gamyacouture.shared.storage;

import com.gamyacouture.shared.exception.BusinessException;
import com.gamyacouture.shared.exception.ErrorCode;
import com.gamyacouture.shared.config.S3StorageProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.exception.SdkClientException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.io.IOException;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.storage.s3.enabled", havingValue = "true")
public class S3ImageStorageService implements ImageStorageService {

    private static final Set<String> IMAGE_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    private static final Set<String> VIDEO_CONTENT_TYPES = Set.of(
            "video/mp4",
            "video/webm",
            "video/quicktime"
    );

    private static final Map<MediaUploadType, Set<String>> ALLOWED_BY_TYPE = Map.of(
            MediaUploadType.IMAGE, IMAGE_CONTENT_TYPES,
            MediaUploadType.VIDEO, VIDEO_CONTENT_TYPES
    );

    private final S3Client s3Client;
    private final S3StorageProperties properties;

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public String upload(MultipartFile file, String folder, MediaUploadType type) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "File is required");
        }
        String contentType = normalizeContentType(file.getContentType());
        Set<String> allowed = ALLOWED_BY_TYPE.get(type);
        if (contentType == null || !allowed.contains(contentType)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, unsupportedTypeMessage(type));
        }
        if (!StringUtils.hasText(properties.bucket())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "S3 bucket is not configured");
        }

        String safeFolder = sanitizeFolder(folder);
        String extension = extensionFor(contentType, type);
        String key = objectKey(properties.keyPrefix(), safeFolder, UUID.randomUUID() + extension);

        try {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(properties.bucket())
                    .key(key)
                    .contentType(contentType)
                    .build();
            s3Client.putObject(request, RequestBody.fromBytes(file.getBytes()));
        } catch (IOException ex) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "Failed to read uploaded file");
        } catch (S3Exception ex) {
            log.error("S3 upload failed: status={}, bucket={}, key={}",
                    ex.statusCode(), properties.bucket(), key, ex);
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, s3FailureMessage(ex));
        } catch (SdkClientException ex) {
            log.error("S3 client error during upload to bucket={}", properties.bucket(), ex);
            throw new BusinessException(ErrorCode.INTERNAL_ERROR,
                    "S3 upload failed. Check AWS credentials or EC2 instance IAM role.");
        }

        return publicUrl(key);
    }

    private static String s3FailureMessage(S3Exception ex) {
        String code = ex.awsErrorDetails() != null ? ex.awsErrorDetails().errorCode() : null;
        if (code == null && ex.statusCode() == 403) {
            code = "AccessDenied";
        }
        if ("AccessDenied".equals(code)) {
            return "S3 upload denied. EC2 instance role needs s3:PutObject on the media bucket.";
        }
        return "S3 upload failed (" + (code != null ? code : "HTTP " + ex.statusCode())
                + "). Check bucket, region, and IAM permissions.";
    }

    private static String unsupportedTypeMessage(MediaUploadType type) {
        return switch (type) {
            case IMAGE -> "Unsupported image type. Allowed: JPEG, PNG, WebP, GIF";
            case VIDEO -> "Unsupported video type. Allowed: MP4, WebM, MOV";
        };
    }

    private static String normalizeContentType(String contentType) {
        if (contentType == null) {
            return null;
        }
        return contentType.toLowerCase(Locale.ROOT).split(";")[0].trim();
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

    private static String extensionFor(String contentType, MediaUploadType type) {
        if (type == MediaUploadType.VIDEO) {
            return switch (contentType) {
                case "video/webm" -> ".webm";
                case "video/quicktime" -> ".mov";
                default -> ".mp4";
            };
        }
        return switch (contentType) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> ".jpg";
        };
    }
}
