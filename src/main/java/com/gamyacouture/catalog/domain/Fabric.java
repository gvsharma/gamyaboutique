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
@Table(name = "fabrics")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Fabric extends BaseSoftDeletableEntity {

    @Id
    private UUID id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 200)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 500)
    private String composition;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
}
