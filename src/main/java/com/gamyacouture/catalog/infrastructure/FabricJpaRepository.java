package com.gamyacouture.catalog.infrastructure;

import com.gamyacouture.catalog.domain.Fabric;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FabricJpaRepository extends JpaRepository<Fabric, UUID> {

    List<Fabric> findByActiveTrueOrderByNameAsc();

    java.util.Optional<Fabric> findByIdAndActiveTrue(UUID id);
}
