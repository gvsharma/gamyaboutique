package com.gamyacouture.product.application;

import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CsvProductParserTest {

    @Test
    void parse_readsHeadersAndRows() throws Exception {
        String csv = """
                sku,name,price,category_slug
                GC-001,Test Saree,1999.00,sarees
                GC-002,"Silk Kurta, Red",2499.00,kurtas
                """;

        CsvProductParser.ParsedCsv parsed = CsvProductParser.parse(
                new ByteArrayInputStream(csv.getBytes(StandardCharsets.UTF_8)));

        assertThat(parsed.headers()).containsExactly("sku", "name", "price", "category_slug");
        assertThat(parsed.rows()).hasSize(2);
        assertThat(parsed.rows().get(0)).containsEntry("sku", "GC-001");
        assertThat(parsed.rows().get(1)).containsEntry("name", "Silk Kurta, Red");
    }

    @Test
    void parse_rejectsEmptyFile() {
        assertThatThrownBy(() -> CsvProductParser.parse(new ByteArrayInputStream(new byte[0])))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("empty");
    }

    @Test
    void parseLine_handlesQuotedCommas() {
        List<String> fields = CsvProductParser.parseLine("\"Hello, world\",123");
        assertThat(fields).containsExactly("Hello, world", "123");
    }

    @Test
    void normalizeHeader_convertsSpacesToUnderscores() {
        assertThat(CsvProductParser.normalizeHeader(" Category Slug ")).isEqualTo("category_slug");
    }
}
