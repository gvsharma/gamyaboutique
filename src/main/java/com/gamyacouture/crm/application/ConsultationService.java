package com.gamyacouture.crm.application;

import com.gamyacouture.crm.api.dto.CreateConsultationRequest;
import com.gamyacouture.crm.api.dto.CrmLeadDto;
import com.gamyacouture.crm.domain.CrmLead;
import com.gamyacouture.crm.domain.LeadSource;
import com.gamyacouture.crm.domain.LeadStatus;
import com.gamyacouture.crm.infrastructure.CrmLeadJpaRepository;
import com.gamyacouture.crm.infrastructure.mapper.CrmLeadMapper;
import com.gamyacouture.product.domain.ProductStatus;
import com.gamyacouture.product.infrastructure.ProductJpaRepository;
import com.gamyacouture.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ConsultationService {

    private final CrmLeadJpaRepository leadRepository;
    private final CrmLeadMapper leadMapper;
    private final ProductJpaRepository productRepository;

    @Transactional
    public CrmLeadDto submit(CreateConsultationRequest request) {
        String email = request.email() != null && !request.email().isBlank()
                ? request.email().trim().toLowerCase()
                : placeholderEmail(request.phone());

        CrmLead lead = CrmLead.builder()
                .id(UUID.randomUUID())
                .name(request.name().trim())
                .email(email)
                .phone(request.phone().trim())
                .source(LeadSource.CONSULTATION)
                .status(LeadStatus.NEW)
                .notes(blankToNull(request.message()))
                .occasion(blankToNull(request.occasion()))
                .budgetBand(blankToNull(request.budgetBand()))
                .timeline(blankToNull(request.timeline()))
                .serviceType(blankToNull(request.serviceType()))
                .build();

        if (request.productId() != null) {
            productRepository.findByIdAndStatus(request.productId(), ProductStatus.ACTIVE)
                    .ifPresent(lead::setProduct);
        }

        return leadMapper.toDto(leadRepository.save(lead));
    }

    private static String placeholderEmail(String phone) {
        String normalized = phone.replaceAll("\\D", "");
        return "consult+" + normalized + "@gamyacouture.local";
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
