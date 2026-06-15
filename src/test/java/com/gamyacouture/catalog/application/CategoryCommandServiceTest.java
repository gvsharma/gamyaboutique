package com.gamyacouture.catalog.application;

import com.gamyacouture.catalog.api.dto.UpsertCategoryRequest;
import com.gamyacouture.catalog.infrastructure.CategoryJpaRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Testcontainers
@ActiveProfiles("test")
class CategoryCommandServiceTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("gamya_couture_test")
            .withUsername("gamya")
            .withPassword("gamya_secret");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
    }

    @Autowired
    private CategoryCommandService categoryCommandService;

    @Autowired
    private CategoryJpaRepository categoryRepository;

    @Test
    void deactivateSoftDeletesCategoryFromAdminList() {
        var created = categoryCommandService.create(new UpsertCategoryRequest(
                "Deactivate Test",
                "deactivate-test",
                null,
                null,
                99,
                true,
                null
        ));

        categoryCommandService.deactivate(created.id());

        assertThat(categoryRepository.findAllByOrderByDisplayOrderAscNameAsc())
                .noneMatch(category -> category.getId().equals(created.id()));
        assertThat(categoryCommandService.listAll())
                .noneMatch(category -> category.id().equals(created.id()));
    }
}
