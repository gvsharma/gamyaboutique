package com.gamyacouture.site.application;

import com.gamyacouture.shared.exception.ResourceNotFoundException;
import com.gamyacouture.shared.validation.ImageUrlValidator;
import com.gamyacouture.shared.validation.MediaUrlValidator;
import com.gamyacouture.site.api.dto.PromoVideoDto;
import com.gamyacouture.site.api.dto.UpsertPromoVideoRequest;
import com.gamyacouture.site.domain.PromoVideo;
import com.gamyacouture.site.infrastructure.PromoVideoJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PromoVideoService {

    private final PromoVideoJpaRepository promoVideoRepository;

    @Transactional(readOnly = true)
    public List<PromoVideoDto> listActive() {
        return promoVideoRepository.findByActiveTrueOrderByDisplayOrderAscTitleAsc().stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PromoVideoDto> listAll() {
        return promoVideoRepository.findAllByOrderByDisplayOrderAscTitleAsc().stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public PromoVideoDto getById(UUID id) {
        return toDto(findById(id));
    }

    @Transactional
    public PromoVideoDto create(UpsertPromoVideoRequest request) {
        PromoVideo video = PromoVideo.builder()
                .id(UUID.randomUUID())
                .build();
        applyRequest(video, request);
        return toDto(promoVideoRepository.save(video));
    }

    @Transactional
    public PromoVideoDto update(UUID id, UpsertPromoVideoRequest request) {
        PromoVideo video = findById(id);
        applyRequest(video, request);
        return toDto(promoVideoRepository.save(video));
    }

    @Transactional
    public void delete(UUID id) {
        if (!promoVideoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Promo video not found: " + id);
        }
        promoVideoRepository.deleteById(id);
    }

    private PromoVideo findById(UUID id) {
        return promoVideoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promo video not found: " + id));
    }

    private void applyRequest(PromoVideo video, UpsertPromoVideoRequest request) {
        video.setTitle(request.title().trim());
        video.setDescription(blankToNull(request.description()));
        MediaUrlValidator.validate(request.videoUrl().trim());
        video.setVideoUrl(request.videoUrl().trim());
        if (request.posterUrl() != null && !request.posterUrl().isBlank()) {
            ImageUrlValidator.validate(request.posterUrl().trim());
            video.setPosterUrl(request.posterUrl().trim());
        } else {
            video.setPosterUrl(null);
        }
        video.setDisplayOrder(request.displayOrder() != null ? request.displayOrder() : 0);
        video.setActive(request.active() == null || request.active());
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private PromoVideoDto toDto(PromoVideo video) {
        return new PromoVideoDto(
                video.getId(),
                video.getTitle(),
                video.getDescription(),
                video.getVideoUrl(),
                video.getPosterUrl(),
                video.getDisplayOrder(),
                video.isActive(),
                video.getUpdatedAt());
    }
}
