package com.gamyacouture.crm.api.dto;

import jakarta.validation.constraints.Size;

public record UpdateStylistNotesRequest(
        @Size(max = 5000) String stylistNotes) {
}
