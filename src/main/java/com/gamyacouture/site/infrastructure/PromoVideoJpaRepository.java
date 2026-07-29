package com.gamyacouture.site.infrastructure;

import com.gamyacouture.site.domain.PromoVideo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PromoVideoJpaRepository extends JpaRepository<PromoVideo, UUID> {

    List<PromoVideo> findByActiveTrueOrderByDisplayOrderAscTitleAsc();

    List<PromoVideo> findAllByOrderByDisplayOrderAscTitleAsc();
}
