package com.gamyacouture.auth.domain;

public enum Role {
    ADMIN,
    STAFF,
    CUSTOMER;

    public String getAuthority() {
        return "ROLE_" + name();
    }
}
