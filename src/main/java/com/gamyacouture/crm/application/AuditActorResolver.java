package com.gamyacouture.crm.application;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
public class AuditActorResolver {

    private static final String GUEST = "guest";

    public String currentActorOrGuest() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return GUEST;
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails userDetails) {
            return userDetails.getUsername();
        }
        if (principal instanceof String username && !"anonymousUser".equals(username)) {
            return username;
        }
        return GUEST;
    }

    public String currentActorOrSystem() {
        String actor = currentActorOrGuest();
        return GUEST.equals(actor) ? "system" : actor;
    }
}
