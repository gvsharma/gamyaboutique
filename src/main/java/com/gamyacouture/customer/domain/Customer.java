package com.gamyacouture.customer.domain;

import com.gamyacouture.shared.domain.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "customers")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Customer extends BaseAuditableEntity {

    @Id
    private UUID id;

    @Column(name = "user_id", unique = true)
    private UUID userId;

    @Column(nullable = false)
    private String email;

    @Column(length = 30)
    private String phone;

    @Column(name = "first_name", length = 100)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;
}
