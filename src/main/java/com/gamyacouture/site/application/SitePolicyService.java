package com.gamyacouture.site.application;

import com.gamyacouture.shared.exception.ResourceNotFoundException;
import com.gamyacouture.site.api.dto.SitePolicyDto;
import com.gamyacouture.site.api.dto.UpdateSitePolicyRequest;
import com.gamyacouture.site.domain.PolicyKey;
import com.gamyacouture.site.domain.SitePolicy;
import com.gamyacouture.site.infrastructure.SitePolicyJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SitePolicyService {

    private final SitePolicyJpaRepository sitePolicyJpaRepository;

    @Transactional(readOnly = true)
    public SitePolicyDto getByKey(String key) {
        return toDto(findPolicy(key));
    }

    @Transactional(readOnly = true)
    public List<SitePolicyDto> listAll() {
        return sitePolicyJpaRepository.findAllByOrderByPolicyKeyAsc().stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public SitePolicyDto update(String key, UpdateSitePolicyRequest request) {
        SitePolicy policy = findPolicy(key);
        policy.setTitle(request.title().trim());
        policy.setContent(request.content().trim());
        return toDto(sitePolicyJpaRepository.save(policy));
    }

    private SitePolicy findPolicy(String key) {
        PolicyKey policyKey;
        try {
            policyKey = PolicyKey.fromPath(key);
        } catch (IllegalArgumentException ex) {
            throw new ResourceNotFoundException("Policy not found: " + key);
        }
        return sitePolicyJpaRepository.findByPolicyKey(policyKey)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found: " + key));
    }

    private SitePolicyDto toDto(SitePolicy policy) {
        return new SitePolicyDto(
                policy.getPolicyKey().toPathSegment(),
                policy.getTitle(),
                policy.getContent(),
                policy.getUpdatedAt());
    }
}
