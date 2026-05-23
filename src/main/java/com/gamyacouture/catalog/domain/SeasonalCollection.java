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

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "seasonal_collections")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeasonalCollection extends BaseSoftDeletableEntity {

    @Id
    private UUID id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 200)
    private String slug;

    @Column(nullable = false, length = 30)
    private String season;

    @Column(nullable = false)
    private int year;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "starts_at")
    private LocalDate startsAt;

    @Column(name = "ends_at")
    private LocalDate endsAt;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
}
