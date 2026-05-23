package com.gamyacouture.auth.infrastructure;

import com.gamyacouture.auth.domain.RoleCode;
import com.gamyacouture.auth.domain.RoleEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RoleJpaRepository extends JpaRepository<RoleEntity, UUID> {

    Optional<RoleEntity> findByCode(RoleCode code);
}
