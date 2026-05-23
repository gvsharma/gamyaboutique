package com.gamyacouture.crm.api.web;

import com.gamyacouture.crm.api.dto.CustomerInterestDto;
import com.gamyacouture.crm.api.dto.InterestProductSummaryDto;
import com.gamyacouture.crm.application.CustomerInterestService;
import com.gamyacouture.crm.domain.CustomerInterestStatus;
import com.gamyacouture.shared.web.GlobalExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AdminInterestControllerTest {

    @Mock
    private CustomerInterestService customerInterestService;

    @InjectMocks
    private AdminInterestController adminInterestController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(adminInterestController)
                .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void list_returnsPagedInterests() throws Exception {
        UUID productId = UUID.randomUUID();
        CustomerInterestDto dto = new CustomerInterestDto(
                UUID.randomUUID(),
                new InterestProductSummaryDto(productId, "Silk Saree", "SKU-001"),
                "Priya Sharma",
                "+919876543210",
                null,
                "M",
                "Maroon",
                "Wedding enquiry",
                CustomerInterestStatus.NEW,
                Instant.parse("2026-05-01T10:00:00Z"),
                Instant.parse("2026-05-01T10:00:00Z"));

        when(customerInterestService.list(any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(dto)));

        mockMvc.perform(get("/api/v1/admin/interests")
                        .param("status", "NEW")
                        .param("productId", productId.toString())
                        .param("phone", "98765")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].customerName").value("Priya Sharma"))
                .andExpect(jsonPath("$.data.content[0].status").value("NEW"));
    }

    @Test
    void updateStatus_returnsUpdatedInterest() throws Exception {
        UUID id = UUID.randomUUID();
        UUID productId = UUID.randomUUID();
        CustomerInterestDto dto = new CustomerInterestDto(
                id,
                new InterestProductSummaryDto(productId, "Silk Saree", "SKU-001"),
                "Priya Sharma",
                "+919876543210",
                null,
                "M",
                "Maroon",
                null,
                CustomerInterestStatus.CONTACTED,
                Instant.parse("2026-05-01T10:00:00Z"),
                Instant.parse("2026-05-01T11:00:00Z"));

        when(customerInterestService.updateStatus(eq(id), any())).thenReturn(dto);

        mockMvc.perform(put("/api/v1/admin/interests/{id}/status", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "status": "CONTACTED",
                                  "note": "Called customer"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("CONTACTED"));
    }

    @Test
    void updateStatus_requiresStatus() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(put("/api/v1/admin/interests/{id}/status", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }
}
