package com.gamyacouture.crm.infrastructure;

import com.gamyacouture.crm.domain.CrmLead;
import com.gamyacouture.crm.domain.LeadStatus;
import com.gamyacouture.crm.infrastructure.projection.LeadStatusCount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CrmLeadJpaRepository extends JpaRepository<CrmLead, UUID> {

    long countByStatusIn(Collection<LeadStatus> statuses);

    Optional<CrmLead> findByEmailIgnoreCaseAndProduct_Id(String email, UUID productId);

    @Query("""
            SELECT l.status AS status, COUNT(l) AS count
            FROM CrmLead l
            GROUP BY l.status
            """)
    List<LeadStatusCount> countGroupByStatus();
}
