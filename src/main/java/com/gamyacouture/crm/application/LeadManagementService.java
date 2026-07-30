package com.gamyacouture.crm.application;

import com.gamyacouture.crm.api.dto.CreateLeadRequest;
import com.gamyacouture.crm.api.dto.CrmLeadDto;
import com.gamyacouture.crm.api.dto.UpdateLeadStatusRequest;
import com.gamyacouture.crm.domain.CrmLead;
import com.gamyacouture.crm.domain.LeadSource;
import com.gamyacouture.crm.domain.LeadStatus;
import com.gamyacouture.crm.infrastructure.CrmLeadJpaRepository;
import com.gamyacouture.crm.infrastructure.mapper.CrmLeadMapper;
import com.gamyacouture.customer.infrastructure.CustomerJpaRepository;
import com.gamyacouture.product.api.event.ProductInterestSubmittedEvent;
import com.gamyacouture.product.infrastructure.ProductJpaRepository;
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
    private final ProductJpaRepository productRepository;
    private final CustomerJpaRepository customerRepository;

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
        lead.setOccasion(blankToNull(request.occasion()));
        lead.setBudgetBand(blankToNull(request.budgetBand()));
        lead.setTimeline(blankToNull(request.timeline()));
        lead.setServiceType(blankToNull(request.serviceType()));
        if (request.productId() != null) {
            lead.setProduct(productRepository.getReferenceById(request.productId()));
        }
        if (request.customerId() != null) {
            lead.setCustomer(customerRepository.getReferenceById(request.customerId()));
        }
        return leadMapper.toDto(leadRepository.save(lead));
    }

    @Transactional
    public CrmLeadDto updateStylistNotes(UUID id, String stylistNotes) {
        CrmLead lead = findLead(id);
        lead.setStylistNotes(blankToNull(stylistNotes));
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
        findExistingLead(event).ifPresentOrElse(
                existing -> updateFromInterest(existing, event),
                () -> leadRepository.save(buildLeadFromInterest(event)));
    }

    private java.util.Optional<CrmLead> findExistingLead(ProductInterestSubmittedEvent event) {
        if (event.email() != null && !event.email().isBlank()) {
            return leadRepository.findByEmailIgnoreCaseAndProduct_Id(event.email(), event.productId());
        }
        return leadRepository.findByPhoneAndProduct_Id(event.phone(), event.productId());
    }

    private void updateFromInterest(CrmLead lead, ProductInterestSubmittedEvent event) {
        lead.setName(event.customerName());
        lead.setPhone(event.phone());
        if (event.customerId() != null) {
            lead.setCustomer(customerRepository.getReferenceById(event.customerId()));
        }
        if (event.message() != null && !event.message().isBlank()) {
            lead.setNotes(appendNotes(lead.getNotes(), event.message().trim()));
        }
        leadRepository.save(lead);
    }

    private CrmLead buildLeadFromInterest(ProductInterestSubmittedEvent event) {
        String email = event.email() != null && !event.email().isBlank()
                ? event.email().trim().toLowerCase()
                : placeholderEmail(event.phone(), event.productId());

        return CrmLead.builder()
                .id(UUID.randomUUID())
                .name(event.customerName())
                .email(email)
                .phone(event.phone())
                .source(LeadSource.CUSTOMER_INTEREST)
                .status(LeadStatus.NEW)
                .notes(buildNotes(event))
                .product(productRepository.getReferenceById(event.productId()))
                .customer(event.customerId() != null
                        ? customerRepository.getReferenceById(event.customerId()) : null)
                .build();
    }

    private static String buildNotes(ProductInterestSubmittedEvent event) {
        StringBuilder notes = new StringBuilder();
        if (event.message() != null && !event.message().isBlank()) {
            notes.append(event.message().trim());
        }
        appendLine(notes, "WhatsApp", event.whatsapp());
        appendLine(notes, "Size", event.size());
        appendLine(notes, "Color", event.color());
        return notes.isEmpty() ? null : notes.toString().trim();
    }

    private static void appendLine(StringBuilder notes, String label, String value) {
        if (value != null && !value.isBlank()) {
            if (!notes.isEmpty()) {
                notes.append('\n');
            }
            notes.append(label).append(": ").append(value.trim());
        }
    }

    private static String placeholderEmail(String phone, UUID productId) {
        String normalizedPhone = phone.replaceAll("\\D", "");
        return normalizedPhone + "+" + productId + "@interest.gamyacouture.local";
    }

    private CrmLead findLead(UUID id) {
        return leadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found: " + id));
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
