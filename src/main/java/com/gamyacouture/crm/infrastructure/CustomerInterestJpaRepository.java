package com.gamyacouture.crm.infrastructure;

import com.gamyacouture.crm.domain.CustomerInterest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.UUID;

public interface CustomerInterestJpaRepository
        extends JpaRepository<CustomerInterest, UUID>, JpaSpecificationExecutor<CustomerInterest> {

    @Query("SELECT COUNT(ci) FROM CustomerInterest ci WHERE ci.createdAt >= :since")
    long countSince(@Param("since") Instant since);
}
