package com.gamyacouture.site.application;

import com.gamyacouture.site.api.dto.UpsertPromoVideoRequest;
import com.gamyacouture.site.domain.PromoVideo;
import com.gamyacouture.site.infrastructure.PromoVideoJpaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PromoVideoServiceTest {

    @Mock
    private PromoVideoJpaRepository promoVideoRepository;

    @InjectMocks
    private PromoVideoService promoVideoService;

    @Test
    void create_savesActivePromoVideo() {
        when(promoVideoRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        var request = new UpsertPromoVideoRequest(
                "Bridal showcase",
                "Our latest bridal edit",
                "https://images.unsplash.com/photo-1583391734527-658aeeef0f35?w=1200&q=80",
                null,
                1,
                true);

        var dto = promoVideoService.create(request);

        ArgumentCaptor<PromoVideo> captor = ArgumentCaptor.forClass(PromoVideo.class);
        verify(promoVideoRepository).save(captor.capture());
        assertThat(captor.getValue().getTitle()).isEqualTo("Bridal showcase");
        assertThat(captor.getValue().isActive()).isTrue();
        assertThat(dto.title()).isEqualTo("Bridal showcase");
    }
}
