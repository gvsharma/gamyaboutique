package com.gamyacouture.admin.api.web;

import com.gamyacouture.admin.api.dto.MediaUploadResponse;
import com.gamyacouture.shared.storage.ImageStorageService;
import com.gamyacouture.shared.storage.MediaUploadType;
import com.gamyacouture.shared.web.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import static com.gamyacouture.shared.config.OpenApiConfig.BEARER_AUTH;

@RestController
@RequestMapping("/api/v1/admin/media")
@RequiredArgsConstructor
@Tag(name = "Admin Media")
@SecurityRequirement(name = BEARER_AUTH)
@PreAuthorize("hasRole('ADMIN')")
public class AdminMediaController {

    private final ImageStorageService imageStorageService;

    @PostMapping("/upload")
    @Operation(summary = "Upload a product image to S3 and return the public URL")
    public ApiResponse<MediaUploadResponse> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "products") String folder) {
        return upload(file, folder, MediaUploadType.IMAGE, "Image uploaded");
    }

    @PostMapping("/upload-video")
    @Operation(summary = "Upload a product video to S3 and return the public URL")
    public ApiResponse<MediaUploadResponse> uploadVideo(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "videos") String folder) {
        return upload(file, folder, MediaUploadType.VIDEO, "Video uploaded");
    }

    private ApiResponse<MediaUploadResponse> upload(
            MultipartFile file, String folder, MediaUploadType type, String message) {
        String url = imageStorageService.upload(file, folder, type);
        String provider = imageStorageService.isEnabled() ? "s3" : "disabled";
        return ApiResponse.ok(new MediaUploadResponse(url, provider), message);
    }
}
