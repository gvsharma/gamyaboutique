package com.gamyacouture.product.application;

import com.gamyacouture.catalog.domain.Category;
import com.gamyacouture.catalog.domain.Fabric;
import com.gamyacouture.catalog.infrastructure.CategoryJpaRepository;
import com.gamyacouture.catalog.infrastructure.FabricJpaRepository;
import com.gamyacouture.catalog.infrastructure.PrintJpaRepository;
import com.gamyacouture.product.api.dto.BulkProductImportRequest;
import com.gamyacouture.product.api.dto.BulkProductImportResultDto;
import com.gamyacouture.product.api.dto.BulkProductPreviewResponse;
import com.gamyacouture.product.api.dto.ProductDetailDto;
import com.gamyacouture.product.api.dto.UpsertProductRequest;
import com.gamyacouture.product.domain.ProductStatus;
import com.gamyacouture.product.infrastructure.ProductJpaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductBulkImportServiceTest {

    @Mock
    private CategoryJpaRepository categoryRepository;
    @Mock
    private FabricJpaRepository fabricRepository;
    @Mock
    private PrintJpaRepository printRepository;
    @Mock
    private ProductJpaRepository productRepository;
    @Mock
    private ProductCommandService productCommandService;

    @InjectMocks
    private ProductBulkImportService productBulkImportService;

    private Category sareesCategory;
    private Fabric banarasiFabric;

    @BeforeEach
    void setUp() {
        sareesCategory = Category.builder()
                .id(UUID.fromString("40100000-0000-0000-0000-000000000004"))
                .name("Sarees")
                .slug("sarees")
                .active(true)
                .build();

        UUID womenId = UUID.fromString("40100000-0000-0000-0000-000000000001");
        Category women = Category.builder()
                .id(womenId)
                .name("Women")
                .slug("women")
                .active(true)
                .build();
        sareesCategory.setParent(women);

        banarasiFabric = Fabric.builder()
                .id(UUID.fromString("20100000-0000-0000-0000-000000000001"))
                .name("Banarasi Silk")
                .slug("banarasi-silk")
                .active(true)
                .build();
    }

    @Test
    void preview_marksValidRowWhenTaxonomyMatches() throws Exception {
        when(categoryRepository.findByActiveTrueOrderByDisplayOrderAscNameAsc())
                .thenReturn(List.of(sareesCategory));
        when(fabricRepository.findByActiveTrueOrderByNameAsc()).thenReturn(List.of(banarasiFabric));
        when(printRepository.findByActiveTrueOrderByNameAsc()).thenReturn(List.of());
        when(productRepository.existsBySku("GC-CSV-001")).thenReturn(false);

        String csv = """
                sku,name,price,category_slug,fabric_slug,sizes,colors,image_urls
                GC-CSV-001,Bulk Saree,2999.00,sarees,banarasi-silk,S|M,Maroon:#722F37,https://images.unsplash.com/photo-1583391734527-658aeeef0f35?w=1200&q=80
                """;

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "products.csv",
                "text/csv",
                csv.getBytes());

        BulkProductPreviewResponse response = productBulkImportService.preview(file);

        assertThat(response.totalRows()).isEqualTo(1);
        assertThat(response.validRows()).isEqualTo(1);
        assertThat(response.rows().getFirst().valid()).isTrue();
        assertThat(response.rows().getFirst().product()).isNotNull();
        assertThat(response.rows().getFirst().product().primaryCategoryId()).isEqualTo(sareesCategory.getId());
    }

    @Test
    void preview_flagsDuplicateSkuInCsv() throws Exception {
        when(categoryRepository.findByActiveTrueOrderByDisplayOrderAscNameAsc())
                .thenReturn(List.of(sareesCategory));
        when(fabricRepository.findByActiveTrueOrderByNameAsc()).thenReturn(List.of());
        when(printRepository.findByActiveTrueOrderByNameAsc()).thenReturn(List.of());
        when(productRepository.existsBySku("GC-DUP")).thenReturn(false);

        String csv = """
                sku,name,price,category_slug
                GC-DUP,First,1000.00,sarees
                GC-DUP,Second,2000.00,sarees
                """;

        MockMultipartFile file = new MockMultipartFile("file", "products.csv", "text/csv", csv.getBytes());
        BulkProductPreviewResponse response = productBulkImportService.preview(file);

        assertThat(response.validRows()).isEqualTo(1);
        assertThat(response.rows().get(0).valid()).isTrue();
        assertThat(response.rows().get(1).valid()).isFalse();
        assertThat(response.rows().get(1).errors()).anyMatch(error -> error.contains("duplicate sku"));
    }

    @Test
    void preview_rejectsMissingRequiredColumns() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "products.csv",
                "text/csv",
                "sku,name\nGC-1,Test".getBytes());

        assertThatThrownBy(() -> productBulkImportService.preview(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("price");
    }

    @Test
    void importProducts_createsEachValidatedProduct() {
        UpsertProductRequest request = new UpsertProductRequest(
                "GC-IMP-001",
                "Imported Product",
                null,
                new BigDecimal("1500.00"),
                null,
                "INR",
                ProductStatus.DRAFT,
                sareesCategory.getId(),
                null,
                null,
                List.of(sareesCategory.getId()),
                List.of(),
                null,
                null,
                5,
                null,
                null);

        when(productCommandService.create(any())).thenReturn(
                new ProductDetailDto(
                        UUID.randomUUID(),
                        request.sku(),
                        request.name(),
                        null,
                        request.price(),
                        null,
                        request.price(),
                        false,
                        request.currency(),
                        request.status(),
                        sareesCategory.getId(),
                        null,
                        null,
                        null,
                        List.of(),
                        List.of(),
                        List.of(),
                        null,
                        null,
                        5,
                        false,
                        List.of(),
                        List.of()));

        BulkProductImportResultDto result = productBulkImportService.importProducts(List.of(request));

        assertThat(result.created()).isEqualTo(1);
        assertThat(result.failed()).isZero();
        verify(productCommandService).create(request);
    }

    @Test
    void importProducts_collectsFailuresWithoutStopping() {
        UpsertProductRequest first = new UpsertProductRequest(
                "GC-OK",
                "OK",
                null,
                new BigDecimal("1000.00"),
                null,
                "INR",
                ProductStatus.DRAFT,
                sareesCategory.getId(),
                null,
                null,
                List.of(sareesCategory.getId()),
                List.of(),
                null,
                null,
                5,
                null,
                null);
        UpsertProductRequest second = new UpsertProductRequest(
                "GC-FAIL",
                "Fail",
                null,
                new BigDecimal("1000.00"),
                null,
                "INR",
                ProductStatus.DRAFT,
                sareesCategory.getId(),
                null,
                null,
                List.of(sareesCategory.getId()),
                List.of(),
                null,
                null,
                5,
                null,
                null);

        when(productCommandService.create(first)).thenReturn(
                new ProductDetailDto(
                        UUID.randomUUID(),
                        first.sku(),
                        first.name(),
                        null,
                        first.price(),
                        null,
                        first.price(),
                        false,
                        first.currency(),
                        first.status(),
                        sareesCategory.getId(),
                        null,
                        null,
                        null,
                        List.of(),
                        List.of(),
                        List.of(),
                        null,
                        null,
                        5,
                        false,
                        List.of(),
                        List.of()));
        when(productCommandService.create(second)).thenThrow(new RuntimeException("DB error"));

        BulkProductImportResultDto result = productBulkImportService.importProducts(List.of(first, second));

        assertThat(result.created()).isEqualTo(1);
        assertThat(result.failed()).isEqualTo(1);
        assertThat(result.failures().getFirst().sku()).isEqualTo("GC-FAIL");
    }
}
