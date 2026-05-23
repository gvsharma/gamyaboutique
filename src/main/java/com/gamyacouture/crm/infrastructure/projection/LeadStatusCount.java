package com.gamyacouture.crm.infrastructure.projection;

import com.gamyacouture.crm.domain.LeadStatus;

public interface LeadStatusCount {

    LeadStatus getStatus();

    long getCount();
}
