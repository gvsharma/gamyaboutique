package com.gamyacouture.catalog.domain;

import com.gamyacouture.shared.domain.BaseSoftDeletableEntity;
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
@Table(name = "prints")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Print extends BaseSoftDeletableEntity {

    @Id
    private UUID id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 200)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "pattern_type", length = 50)
    private String patternType;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
}
