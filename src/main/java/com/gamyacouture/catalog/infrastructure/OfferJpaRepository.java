package com.gamyacouture.catalog.infrastructure;

import com.gamyacouture.catalog.domain.Offer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OfferJpaRepository extends JpaRepository<Offer, UUID> {

    List<Offer> findAllByOrderByNameAsc();
}
