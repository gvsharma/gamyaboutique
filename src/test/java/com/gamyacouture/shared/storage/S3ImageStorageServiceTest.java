package com.gamyacouture.shared.storage;

import com.gamyacouture.shared.config.S3StorageProperties;
import com.gamyacouture.shared.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class S3ImageStorageServiceTest {

    @Mock
    private S3Client s3Client;

    private S3ImageStorageService service;

    @BeforeEach
    void setUp() {
        S3StorageProperties properties = new S3StorageProperties(
                true,
                "gamya-couture-dev-media",
                "ap-south-1",
                "https://d2568bpd35bq6a.cloudfront.net",
                "products/"
        );
        service = new S3ImageStorageService(s3Client, properties);
    }

    @Test
    void upload_returnsCloudFrontUrl() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "photo.jpg", "image/jpeg", new byte[]{1, 2, 3});

        String url = service.upload(file, "products", MediaUploadType.IMAGE);

        assertThat(url).startsWith("https://d2568bpd35bq6a.cloudfront.net/products/");
        assertThat(url).endsWith(".jpg");

        ArgumentCaptor<PutObjectRequest> requestCaptor = ArgumentCaptor.forClass(PutObjectRequest.class);
        verify(s3Client).putObject(requestCaptor.capture(), any(RequestBody.class));
        assertThat(requestCaptor.getValue().bucket()).isEqualTo("gamya-couture-dev-media");
        assertThat(requestCaptor.getValue().key()).startsWith("products/");
    }

    @Test
    void uploadVideo_usesVideosFolder() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "clip.mp4", "video/mp4", new byte[]{1, 2, 3});

        String url = service.upload(file, "videos", MediaUploadType.VIDEO);

        assertThat(url).contains("/products/videos/");
        assertThat(url).endsWith(".mp4");
    }

    @Test
    void upload_wrapsS3AccessDenied() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "photo.jpg", "image/jpeg", new byte[]{1});
        when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
                .thenThrow(S3Exception.builder().message("Access Denied").statusCode(403).build());

        assertThatThrownBy(() -> service.upload(file, "products", MediaUploadType.IMAGE))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("s3:PutObject");
    }
}
