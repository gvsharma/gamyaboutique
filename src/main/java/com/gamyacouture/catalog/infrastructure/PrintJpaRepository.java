package com.gamyacouture.catalog.infrastructure;

import com.gamyacouture.catalog.domain.Print;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PrintJpaRepository extends JpaRepository<Print, UUID> {

    List<Print> findByActiveTrueOrderByNameAsc();

    List<Print> findAllByOrderByNameAsc();

    java.util.Optional<Print> findByIdAndActiveTrue(UUID id);
}
