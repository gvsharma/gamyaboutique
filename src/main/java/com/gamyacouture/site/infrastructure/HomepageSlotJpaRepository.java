package com.gamyacouture.site.infrastructure;

import com.gamyacouture.site.domain.HomepageSlot;
import com.gamyacouture.site.domain.HomepageSlotKey;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HomepageSlotJpaRepository extends JpaRepository<HomepageSlot, HomepageSlotKey> {

    List<HomepageSlot> findAllByOrderBySlotKeyAsc();
}
