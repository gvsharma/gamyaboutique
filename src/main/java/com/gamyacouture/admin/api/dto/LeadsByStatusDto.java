package com.gamyacouture.admin.api.dto;

import com.gamyacouture.crm.domain.LeadStatus;

import java.util.Map;

public record LeadsByStatusDto(
        Map<LeadStatus, Long> counts
) {
}
