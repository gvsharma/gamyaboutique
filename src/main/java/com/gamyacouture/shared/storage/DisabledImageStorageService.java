package com.gamyacouture.shared.storage;

import com.gamyacouture.shared.exception.BusinessException;
import com.gamyacouture.shared.exception.ErrorCode;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@ConditionalOnProperty(name = "app.storage.s3.enabled", havingValue = "false", matchIfMissing = true)
public class DisabledImageStorageService implements ImageStorageService {

    @Override
    public boolean isEnabled() {
        return false;
    }

    @Override
    public String upload(MultipartFile file, String folder, MediaUploadType type) {
        throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                "Media upload is disabled. Set APP_STORAGE_S3_ENABLED=true and configure the S3 bucket.");
    }
}
