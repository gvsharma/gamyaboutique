package com.gamyacouture.admin.api.dto;

public record DashboardSummaryDto(
        long activeProducts,
        long activeCategories,
        long openLeads,
        long recentInterests
) {
}
