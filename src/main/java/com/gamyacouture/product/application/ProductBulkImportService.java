package com.gamyacouture.product.application;

import com.gamyacouture.catalog.application.CategoryTaxonomy;
import com.gamyacouture.catalog.domain.Category;
import com.gamyacouture.catalog.domain.Fabric;
import com.gamyacouture.catalog.domain.Print;
import com.gamyacouture.catalog.infrastructure.CategoryJpaRepository;
import com.gamyacouture.catalog.infrastructure.FabricJpaRepository;
import com.gamyacouture.catalog.infrastructure.PrintJpaRepository;
import com.gamyacouture.product.api.dto.BulkProductImportFailureDto;
import com.gamyacouture.product.api.dto.BulkProductImportResultDto;
import com.gamyacouture.product.api.dto.BulkProductPreviewResponse;
import com.gamyacouture.product.api.dto.BulkProductRowPreviewDto;
import com.gamyacouture.product.api.dto.ProductColorDto;
import com.gamyacouture.product.api.dto.ProductImageInput;
import com.gamyacouture.product.api.dto.UpsertProductRequest;
import com.gamyacouture.product.domain.ProductStatus;
import com.gamyacouture.product.infrastructure.ProductJpaRepository;
import com.gamyacouture.shared.exception.BusinessException;
import com.gamyacouture.shared.validation.ImageUrlValidator;
import com.gamyacouture.shared.validation.MediaUrlValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductBulkImportService {

    static final List<String> MINIMAL_REQUIRED_COLUMNS = List.of("name", "price");
    static final List<String> FULL_REQUIRED_COLUMNS = List.of("sku", "name", "price", "category_slug");
    static final List<String> DOCUMENTED_COLUMNS = List.of(
            "name", "product_type", "description", "price", "sku", "category_slug");

    private final CategoryJpaRepository categoryRepository;
    private final FabricJpaRepository fabricRepository;
    private final PrintJpaRepository printRepository;
    private final ProductJpaRepository productRepository;
    private final ProductCommandService productCommandService;

    public BulkProductPreviewResponse preview(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("CSV file is required");
        }
        String filename = file.getOriginalFilename();
        if (filename != null && !filename.toLowerCase(Locale.ROOT).endsWith(".csv")) {
            throw new IllegalArgumentException("Only .csv files are supported");
        }

        CsvProductParser.ParsedCsv parsed = CsvProductParser.parse(file.getInputStream());
        validateHeaders(parsed.headers());

        TaxonomyLookups lookups = loadLookups();
        Set<String> csvSkus = new HashSet<>();

        List<BulkProductRowPreviewDto> rows = new ArrayList<>();
        int validCount = 0;
        int rowNumber = 1;
        for (Map<String, String> row : parsed.rows()) {
            rowNumber++;
            RowValidation validation = validateRow(row, rowNumber, lookups, csvSkus);
            if (validation.valid()) {
                validCount++;
            }
            rows.add(validation.preview());
        }

        return new BulkProductPreviewResponse(
                rows.size(),
                validCount,
                rows.size() - validCount,
                DOCUMENTED_COLUMNS,
                rows);
    }

    @Transactional
    public BulkProductImportResultDto importProducts(List<UpsertProductRequest> products) {
        List<BulkProductImportFailureDto> failures = new ArrayList<>();
        int created = 0;

        for (UpsertProductRequest request : products) {
            try {
                productCommandService.create(request);
                created++;
            } catch (BusinessException ex) {
                failures.add(new BulkProductImportFailureDto(request.sku(), ex.getMessage()));
            } catch (Exception ex) {
                failures.add(new BulkProductImportFailureDto(request.sku(),
                        ex.getMessage() != null ? ex.getMessage() : "Import failed"));
            }
        }

        return new BulkProductImportResultDto(products.size(), created, failures.size(), failures);
    }

    private void validateHeaders(List<String> headers) {
        List<String> missingMinimal = MINIMAL_REQUIRED_COLUMNS.stream()
                .filter(required -> !headers.contains(required))
                .toList();
        if (!missingMinimal.isEmpty()) {
            throw new IllegalArgumentException("Missing required CSV columns: " + String.join(", ", missingMinimal));
        }
        boolean hasCategoryColumn = headers.contains("category_slug") || headers.contains("product_type");
        if (!hasCategoryColumn) {
            throw new IllegalArgumentException(
                    "Missing product type column: add product_type or category_slug (e.g. sarees, kurtas, lehengas)");
        }
    }

    private TaxonomyLookups loadLookups() {
        Map<String, Category> categoriesBySlug = new LinkedHashMap<>();
        Map<String, Category> categoriesByName = new LinkedHashMap<>();
        for (Category category : categoryRepository.findByActiveTrueOrderByDisplayOrderAscNameAsc()) {
            categoriesBySlug.put(category.getSlug().toLowerCase(Locale.ROOT), category);
            categoriesByName.put(category.getName().trim().toLowerCase(Locale.ROOT), category);
        }

        Map<String, Fabric> fabricsBySlug = new LinkedHashMap<>();
        for (Fabric fabric : fabricRepository.findByActiveTrueOrderByNameAsc()) {
            fabricsBySlug.put(fabric.getSlug().toLowerCase(Locale.ROOT), fabric);
        }

        Map<String, Print> printsBySlug = new LinkedHashMap<>();
        for (Print print : printRepository.findByActiveTrueOrderByNameAsc()) {
            printsBySlug.put(print.getSlug().toLowerCase(Locale.ROOT), print);
        }

        return new TaxonomyLookups(categoriesBySlug, categoriesByName, fabricsBySlug, printsBySlug);
    }

    private RowValidation validateRow(
            Map<String, String> row,
            int rowNumber,
            TaxonomyLookups lookups,
            Set<String> csvSkus) {
        List<String> errors = new ArrayList<>();

        String sku = blankToNull(value(row, "sku"));
        String name = value(row, "name");
        String description = blankToNull(value(row, "description"));
        String priceRaw = value(row, "price");
        String compareAtPriceRaw = blankToNull(value(row, "compare_at_price"));
        String currency = blankToNull(value(row, "currency"));
        String statusRaw = blankToNull(value(row, "status"));
        String categoryInput = resolveCategoryInput(row);
        String categorySlug = categoryInput != null ? categoryInput.toLowerCase(Locale.ROOT) : "";
        String fabricSlug = blankToNull(value(row, "fabric_slug"));
        if (fabricSlug != null) {
            fabricSlug = fabricSlug.toLowerCase(Locale.ROOT);
        }
        String printSlug = blankToNull(value(row, "print_slug"));
        if (printSlug != null) {
            printSlug = printSlug.toLowerCase(Locale.ROOT);
        }
        String stockRaw = blankToNull(value(row, "stock_quantity"));
        String lowStockRaw = blankToNull(value(row, "low_stock_threshold"));
        String sizesRaw = blankToNull(value(row, "sizes"));
        String colorsRaw = blankToNull(value(row, "colors"));
        String imageUrlsRaw = blankToNull(value(row, "image_urls"));
        String videoUrl = blankToNull(value(row, "video_url"));

        if (name.isBlank()) {
            errors.add("name is required");
        }

        BigDecimal price = null;
        if (priceRaw.isBlank()) {
            errors.add("price is required");
        } else {
            try {
                price = new BigDecimal(priceRaw);
                if (price.compareTo(new BigDecimal("0.01")) < 0) {
                    errors.add("price must be at least 0.01");
                }
            } catch (NumberFormatException ex) {
                errors.add("invalid price: " + priceRaw);
            }
        }

        BigDecimal compareAtPrice = null;
        if (compareAtPriceRaw != null) {
            try {
                compareAtPrice = new BigDecimal(compareAtPriceRaw);
                if (compareAtPrice.compareTo(new BigDecimal("0.01")) < 0) {
                    errors.add("compare_at_price must be at least 0.01");
                }
            } catch (NumberFormatException ex) {
                errors.add("invalid compare_at_price: " + compareAtPriceRaw);
            }
        }

        ProductStatus status = ProductStatus.DRAFT;
        if (statusRaw != null) {
            try {
                status = ProductStatus.valueOf(statusRaw.trim().toUpperCase(Locale.ROOT));
            } catch (IllegalArgumentException ex) {
                errors.add("invalid status (use DRAFT, ACTIVE, or ARCHIVED)");
            }
        }

        UUID categoryId = null;
        if (categoryInput == null || categoryInput.isBlank()) {
            errors.add("product_type is required (e.g. sarees, kurtas, lehengas)");
        } else {
            Category category = resolveCategory(categoryInput, lookups);
            if (category == null) {
                errors.add("unknown product_type: " + categoryInput
                        + " (use sarees, kurtas, lehengas, blouses, girls-kurtas, girls-lehengas)");
            } else {
                try {
                    CategoryTaxonomy.validateProductCategory(category);
                    categoryId = category.getId();
                    categorySlug = category.getSlug().toLowerCase(Locale.ROOT);
                } catch (BusinessException ex) {
                    errors.add(ex.getMessage());
                }
            }
        }

        if (sku == null || sku.isBlank()) {
            sku = ProductSkuGenerator.buildBase(name, categorySlug.isBlank() ? null : categorySlug);
            sku = ensureUniqueGeneratedSku(sku, rowNumber, csvSkus);
        } else if (!csvSkus.add(sku.toLowerCase(Locale.ROOT))) {
            errors.add("duplicate sku in CSV: " + sku);
        } else if (productRepository.existsBySku(sku)) {
            errors.add("sku already exists in database: " + sku);
        }

        UUID fabricId = null;
        if (fabricSlug != null) {
            Fabric fabric = lookups.fabricsBySlug().get(fabricSlug);
            if (fabric == null) {
                errors.add("unknown fabric_slug: " + fabricSlug);
            } else {
                fabricId = fabric.getId();
            }
        }

        UUID printId = null;
        if (printSlug != null) {
            Print print = lookups.printsBySlug().get(printSlug);
            if (print == null) {
                errors.add("unknown print_slug: " + printSlug);
            } else {
                printId = print.getId();
            }
        }

        Integer stockQuantity = parseOptionalInt(stockRaw, "stock_quantity", errors);
        Integer lowStockThreshold = parseOptionalInt(lowStockRaw, "low_stock_threshold", errors);

        List<String> sizes = parseSizes(sizesRaw, errors);
        List<ProductColorDto> colors = parseColors(colorsRaw, errors);
        List<ProductImageInput> images = parseImages(imageUrlsRaw, name, errors);

        if (videoUrl != null) {
            try {
                MediaUrlValidator.validate(videoUrl);
            } catch (Exception ex) {
                errors.add("invalid video_url: " + ex.getMessage());
            }
        }

        boolean valid = errors.isEmpty() && price != null && categoryId != null && !name.isBlank() && sku != null && !sku.isBlank();
        UpsertProductRequest product = null;
        if (valid) {
            product = new UpsertProductRequest(
                    sku,
                    name,
                    description,
                    price,
                    compareAtPrice,
                    currency != null ? currency : "INR",
                    status,
                    categoryId,
                    fabricId,
                    printId,
                    List.of(categoryId),
                    images,
                    videoUrl,
                    stockQuantity,
                    lowStockThreshold != null ? lowStockThreshold : 5,
                    sizes.isEmpty() ? null : sizes,
                    colors.isEmpty() ? null : colors,
                    null,
                    null);
        }

        BulkProductRowPreviewDto preview = new BulkProductRowPreviewDto(
                rowNumber,
                sku,
                name,
                description,
                price,
                compareAtPrice,
                currency != null ? currency : "INR",
                status,
                categorySlug,
                fabricSlug,
                printSlug,
                stockQuantity,
                lowStockThreshold,
                sizesRaw,
                colorsRaw,
                imageUrlsRaw,
                videoUrl,
                valid,
                List.copyOf(errors),
                product);

        return new RowValidation(valid, preview);
    }

    private static Integer parseOptionalInt(String raw, String field, List<String> errors) {
        if (raw == null) {
            return null;
        }
        try {
            return Integer.parseInt(raw);
        } catch (NumberFormatException ex) {
            errors.add("invalid " + field + ": " + raw);
            return null;
        }
    }

    private static List<String> parseSizes(String raw, List<String> errors) {
        if (raw == null) {
            return List.of();
        }
        String delimiter = raw.contains("|") ? "\\|" : ",";
        return java.util.Arrays.stream(raw.split(delimiter))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .distinct()
                .toList();
    }

    private static List<ProductColorDto> parseColors(String raw, List<String> errors) {
        if (raw == null) {
            return List.of();
        }
        List<ProductColorDto> colors = new ArrayList<>();
        String delimiter = raw.contains("|") ? "\\|" : ";";
        for (String part : raw.split(delimiter)) {
            String trimmed = part.trim();
            if (trimmed.isBlank()) {
                continue;
            }
            int colon = trimmed.indexOf(':');
            if (colon <= 0) {
                colors.add(new ProductColorDto(trimmed, null));
            } else {
                colors.add(new ProductColorDto(
                        trimmed.substring(0, colon).trim(),
                        trimmed.substring(colon + 1).trim()));
            }
        }
        return colors;
    }

    private static List<ProductImageInput> parseImages(String raw, String altText, List<String> errors) {
        if (raw == null) {
            return List.of();
        }
        List<ProductImageInput> images = new ArrayList<>();
        String[] parts = raw.split("\\|");
        int order = 0;
        for (String part : parts) {
            String url = part.trim();
            if (url.isBlank()) {
                continue;
            }
            try {
                ImageUrlValidator.validate(url);
                images.add(new ProductImageInput(url, altText, order++));
            } catch (Exception ex) {
                errors.add("invalid image URL: " + url);
            }
        }
        return images;
    }

    private static String resolveCategoryInput(Map<String, String> row) {
        String fromSlug = blankToNull(value(row, "category_slug"));
        if (fromSlug != null) {
            return fromSlug;
        }
        return blankToNull(value(row, "product_type"));
    }

    private static Category resolveCategory(String input, TaxonomyLookups lookups) {
        String normalizedSlug = input.trim().toLowerCase(Locale.ROOT).replace(' ', '-');
        Category bySlug = lookups.categoriesBySlug().get(normalizedSlug);
        if (bySlug != null) {
            return bySlug;
        }
        return lookups.categoriesByName().get(input.trim().toLowerCase(Locale.ROOT));
    }

    private String ensureUniqueGeneratedSku(String baseSku, int rowNumber, Set<String> csvSkus) {
        String candidate = baseSku + "-R" + rowNumber;
        int attempt = 0;
        while (!csvSkus.add(candidate.toLowerCase(Locale.ROOT)) || productRepository.existsBySku(candidate)) {
            attempt++;
            candidate = baseSku + "-R" + rowNumber + "-" + attempt;
            if (attempt > 99) {
                candidate = baseSku + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase(Locale.ROOT);
                break;
            }
        }
        return candidate;
    }

    private static String value(Map<String, String> row, String key) {
        return row.getOrDefault(key, "").trim();
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    private record TaxonomyLookups(
            Map<String, Category> categoriesBySlug,
            Map<String, Category> categoriesByName,
            Map<String, Fabric> fabricsBySlug,
            Map<String, Print> printsBySlug) {
    }

    private record RowValidation(boolean valid, BulkProductRowPreviewDto preview) {
    }
}
