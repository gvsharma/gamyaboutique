package com.gamyacouture.shared.storage;

import org.springframework.web.multipart.MultipartFile;

public interface ImageStorageService {

    boolean isEnabled();

    String upload(MultipartFile file, String folder);
}
