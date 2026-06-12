package com.gamyacouture.shared.validation;

import com.gamyacouture.auth.api.dto.RegisterRequest;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class EmailOrPhoneRequiredValidator implements ConstraintValidator<EmailOrPhoneRequired, RegisterRequest> {

    @Override
    public boolean isValid(RegisterRequest request, ConstraintValidatorContext context) {
        if (request == null) {
            return false;
        }
        boolean hasEmail = request.email() != null && !request.email().isBlank();
        boolean hasPhone = request.phone() != null && !request.phone().isBlank();
        return hasEmail || hasPhone;
    }
}
