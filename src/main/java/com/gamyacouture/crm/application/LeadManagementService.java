package com.gamyacouture.crm.application;

import com.gamyacouture.crm.api.dto.CreateLeadRequest;
import com.gamyacouture.crm.api.dto.CrmLeadDto;
import com.gamyacouture.crm.api.dto.UpdateLeadStatusRequest;
import com.gamyacouture.crm.domain.CrmLead;
import com.gamyacouture.crm.domain.LeadSource;
import com.gamyacouture.crm.domain.LeadStatus;
import com.gamyacouture.crm.infrastructure.CrmLeadJpaRepository;
import com.gamyacouture.crm.infrastructure.mapper.CrmLeadMapper;
import com.gamyacouture.product.api.event.ProductInterestSubmittedEvent;
import com.gamyacouture.shared.exception.BusinessException;
import com.gamyacouture.shared.exception.ErrorCode;
import com.gamyacouture.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LeadManagementService {

    private final CrmLeadJpaRepository leadRepository;
    private final CrmLeadMapper leadMapper;

    @Transactional(readOnly = true)
    public Page<CrmLeadDto> listLeads(Pageable pageable) {
        return leadRepository.findAll(pageable).map(leadMapper::toDto);
    }

    @Transactional(readOnly = true)
    public CrmLeadDto getLead(UUID id) {
        return leadMapper.toDto(findLead(id));
    }

    @Transactional
    public CrmLeadDto createLead(CreateLeadRequest request) {
        CrmLead lead = leadMapper.toEntity(request);
        lead.setPhone(blankToNull(request.phone()));
        lead.setNotes(blankToNull(request.notes()));
        return leadMapper.toDto(leadRepository.save(lead));
    }

    @Transactional
    public CrmLeadDto updateStatus(UUID id, UpdateLeadStatusRequest request) {
        CrmLead lead = findLead(id);
        if (lead.getStatus() == request.status()) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION,
                    "Lead is already in status " + request.status());
        }
        lead.setStatus(request.status());
        if (request.notes() != null && !request.notes().isBlank()) {
            lead.setNotes(appendNotes(lead.getNotes(), request.notes().trim()));
        }
        return leadMapper.toDto(leadRepository.save(lead));
    }

    @Transactional
    public void deleteLead(UUID id) {
        if (!leadRepository.existsById(id)) {
            throw new ResourceNotFoundException("Lead not found: " + id);
        }
        leadRepository.deleteById(id);
    }

    @Transactional
    public void createOrUpdateFromProductInterest(ProductInterestSubmittedEvent event) {
        leadRepository.findByEmailIgnoreCaseAndProductId(event.email(), event.productId())
                .ifPresentOrElse(
                        existing -> updateFromInterest(existing, event),
                        () -> leadRepository.save(buildLeadFromInterest(event)));
    }

    private void updateFromInterest(CrmLead lead, ProductInterestSubmittedEvent event) {
        lead.setPhone(event.phone());
        if (event.customerId() != null) {
            lead.setCustomerId(event.customerId());
        }
        if (event.message() != null && !event.message().isBlank()) {
            lead.setNotes(appendNotes(lead.getNotes(), event.message().trim()));
        }
        leadRepository.save(lead);
    }

    private CrmLead buildLeadFromInterest(ProductInterestSubmittedEvent event) {
        return CrmLead.builder()
                .id(UUID.randomUUID())
                .name(deriveName(event.email()))
                .email(event.email().trim().toLowerCase())
                .phone(event.phone())
                .source(LeadSource.PRODUCT_INTEREST)
                .status(LeadStatus.NEW)
                .notes(blankToNull(event.message()))
                .productId(event.productId())
                .customerId(event.customerId())
                .build();
    }

    private CrmLead findLead(UUID id) {
        return leadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found: " + id));
    }

    private static String deriveName(String email) {
        int at = email.indexOf('@');
        return at > 0 ? email.substring(0, at) : email;
    }

    private static String appendNotes(String existing, String addition) {
        if (existing == null || existing.isBlank()) {
            return addition;
        }
        return existing + "\n---\n" + addition;
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
