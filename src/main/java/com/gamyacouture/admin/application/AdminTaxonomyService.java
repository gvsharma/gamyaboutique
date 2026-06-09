package com.gamyacouture.admin.application;

import com.gamyacouture.admin.api.dto.TaxonomyOptionDto;
import com.gamyacouture.catalog.infrastructure.FabricJpaRepository;
import com.gamyacouture.catalog.infrastructure.PrintJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminTaxonomyService {

    private final FabricJpaRepository fabricRepository;
    private final PrintJpaRepository printRepository;

    public List<TaxonomyOptionDto> listFabrics() {
        return fabricRepository.findByActiveTrueOrderByNameAsc().stream()
                .map(f -> new TaxonomyOptionDto(f.getId(), f.getName(), f.getSlug()))
                .toList();
    }

    public List<TaxonomyOptionDto> listPrints() {
        return printRepository.findByActiveTrueOrderByNameAsc().stream()
                .map(p -> new TaxonomyOptionDto(p.getId(), p.getName(), p.getSlug()))
                .toList();
    }
}
