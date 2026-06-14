package com.gamyacouture.catalog.infrastructure;

import com.gamyacouture.catalog.domain.Tag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TagJpaRepository extends JpaRepository<Tag, UUID> {

    List<Tag> findAllByOrderByNameAsc();
}
