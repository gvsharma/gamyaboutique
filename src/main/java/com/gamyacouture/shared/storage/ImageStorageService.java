package com.gamyacouture.shared.storage;

import org.springframework.web.multipart.MultipartFile;

public interface ImageStorageService {

    boolean isEnabled();

    default String upload(MultipartFile file, String folder) {
        return upload(file, folder, MediaUploadType.IMAGE);
    }

    String upload(MultipartFile file, String folder, MediaUploadType type);
}
