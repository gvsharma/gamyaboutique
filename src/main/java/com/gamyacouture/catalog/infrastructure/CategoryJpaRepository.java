package com.gamyacouture.catalog.infrastructure;

import com.gamyacouture.catalog.domain.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryJpaRepository extends JpaRepository<Category, UUID> {

    long countByActiveTrue();

    List<Category> findByActiveTrueOrderByDisplayOrderAscNameAsc();

    Optional<Category> findBySlugAndActiveTrue(String slug);
}
