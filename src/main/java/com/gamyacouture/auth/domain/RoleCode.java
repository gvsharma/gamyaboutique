package com.gamyacouture.auth.domain;

public enum RoleCode {
    ADMIN,
    STAFF,
    CUSTOMER;

    public String getAuthority() {
        return "ROLE_" + name();
    }
}
