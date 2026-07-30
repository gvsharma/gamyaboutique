package com.gamyacouture.crm.api.web;

import com.gamyacouture.crm.api.dto.CreateConsultationRequest;
import com.gamyacouture.crm.api.dto.CrmLeadDto;
import com.gamyacouture.crm.application.ConsultationService;
import com.gamyacouture.shared.web.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/consultations")
@RequiredArgsConstructor
@Tag(name = "Consultations")
public class ConsultationController {

    private final ConsultationService consultationService;

    @PostMapping
    @Operation(summary = "Submit a consultation or appointment request")
    public ApiResponse<CrmLeadDto> submit(@Valid @RequestBody CreateConsultationRequest request) {
        return ApiResponse.ok(consultationService.submit(request), "Consultation request received");
    }
}
