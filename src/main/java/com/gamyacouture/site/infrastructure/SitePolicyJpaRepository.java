package com.gamyacouture.site.infrastructure;

import com.gamyacouture.site.domain.PolicyKey;
import com.gamyacouture.site.domain.SitePolicy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SitePolicyJpaRepository extends JpaRepository<SitePolicy, UUID> {

    Optional<SitePolicy> findByPolicyKey(PolicyKey policyKey);

    List<SitePolicy> findAllByOrderByPolicyKeyAsc();
}
