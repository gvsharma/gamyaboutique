package com.gamyacouture.crm.api.web;

import com.gamyacouture.crm.api.dto.InterestCreatedResponse;
import com.gamyacouture.crm.application.CustomerInterestService;
import com.gamyacouture.shared.web.GlobalExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class InterestControllerTest {

    @Mock
    private CustomerInterestService customerInterestService;

    @InjectMocks
    private InterestController interestController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(interestController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void create_returnsCreatedInterestId() throws Exception {
        UUID id = UUID.randomUUID();
        when(customerInterestService.create(any())).thenReturn(new InterestCreatedResponse(id));

        mockMvc.perform(post("/api/v1/interests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "productId": "550e8400-e29b-41d4-a716-446655440000",
                                  "customerName": "Priya Sharma",
                                  "phone": "+919876543210",
                                  "whatsapp": "+919876543210",
                                  "size": "M",
                                  "color": "Maroon",
                                  "message": "Need this for wedding"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(id.toString()));
    }

    @Test
    void create_requiresProductIdAndCustomerName() throws Exception {
        mockMvc.perform(post("/api/v1/interests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "phone": "+919876543210"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }
}
