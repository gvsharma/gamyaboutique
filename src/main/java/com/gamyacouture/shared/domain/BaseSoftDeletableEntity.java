package com.gamyacouture.shared.domain;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;
import java.time.Instant;

@Getter @Setter
@MappedSuperclass
@SQLRestriction("deleted_at IS NULL")
public abstract class BaseSoftDeletableEntity extends BaseAuditableEntity {
    @Column(name = "deleted_at") private Instant deletedAt;
}
