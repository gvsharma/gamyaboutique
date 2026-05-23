package com.gamyacouture.admin.application;

import com.gamyacouture.admin.api.dto.DashboardSummaryDto;
import com.gamyacouture.admin.api.dto.LeadsByStatusDto;
import com.gamyacouture.catalog.infrastructure.CategoryJpaRepository;
import com.gamyacouture.crm.domain.LeadStatus;
import com.gamyacouture.crm.infrastructure.CrmLeadJpaRepository;
import com.gamyacouture.product.domain.ProductStatus;
import com.gamyacouture.product.infrastructure.ProductInterestJpaRepository;
import com.gamyacouture.product.infrastructure.ProductJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminDashboardService {

    private static final List<LeadStatus> OPEN_STATUSES = List.of(
            LeadStatus.NEW, LeadStatus.CONTACTED, LeadStatus.QUALIFIED);

    private final ProductJpaRepository productRepository;
    private final CategoryJpaRepository categoryRepository;
    private final CrmLeadJpaRepository leadRepository;
    private final ProductInterestJpaRepository interestRepository;

    public DashboardSummaryDto getSummary() {
        Instant sevenDaysAgo = Instant.now().minus(7, ChronoUnit.DAYS);
        return new DashboardSummaryDto(
                productRepository.countByStatus(ProductStatus.ACTIVE),
                categoryRepository.countByActiveTrue(),
                leadRepository.countByStatusIn(OPEN_STATUSES),
                interestRepository.countSince(sevenDaysAgo)
        );
    }

    public LeadsByStatusDto getLeadsByStatus() {
        Map<LeadStatus, Long> counts = new EnumMap<>(LeadStatus.class);
        for (LeadStatus status : LeadStatus.values()) {
            counts.put(status, 0L);
        }
        leadRepository.countGroupByStatus().forEach(row ->
                counts.put(row.getStatus(), row.getCount()));
        return new LeadsByStatusDto(counts);
    }
}
