package com.gamyacouture.admin.application;

import com.gamyacouture.admin.api.dto.AdminFabricDto;
import com.gamyacouture.admin.api.dto.AdminOfferDto;
import com.gamyacouture.admin.api.dto.AdminPrintDto;
import com.gamyacouture.admin.api.dto.AdminTagDto;
import com.gamyacouture.admin.api.dto.TaxonomyOptionDto;
import com.gamyacouture.admin.api.dto.UpsertFabricRequest;
import com.gamyacouture.admin.api.dto.UpsertOfferRequest;
import com.gamyacouture.admin.api.dto.UpsertPrintRequest;
import com.gamyacouture.admin.api.dto.UpsertTagRequest;
import com.gamyacouture.catalog.domain.Fabric;
import com.gamyacouture.catalog.domain.Offer;
import com.gamyacouture.catalog.domain.Print;
import com.gamyacouture.catalog.domain.Tag;
import com.gamyacouture.catalog.domain.TagType;
import com.gamyacouture.catalog.infrastructure.FabricJpaRepository;
import com.gamyacouture.catalog.infrastructure.OfferJpaRepository;
import com.gamyacouture.catalog.infrastructure.PrintJpaRepository;
import com.gamyacouture.catalog.infrastructure.TagJpaRepository;
import com.gamyacouture.shared.exception.BusinessException;
import com.gamyacouture.shared.exception.ErrorCode;
import com.gamyacouture.shared.exception.ResourceNotFoundException;
import com.gamyacouture.shared.util.SlugUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminTaxonomyService {

    private final FabricJpaRepository fabricRepository;
    private final PrintJpaRepository printRepository;
    private final TagJpaRepository tagRepository;
    private final OfferJpaRepository offerRepository;

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

    public List<AdminFabricDto> listAllFabrics() {
        return fabricRepository.findAllByOrderByNameAsc().stream().map(this::toFabricDto).toList();
    }

    public List<AdminPrintDto> listAllPrints() {
        return printRepository.findAllByOrderByNameAsc().stream().map(this::toPrintDto).toList();
    }

    public List<AdminTagDto> listAllTags() {
        return tagRepository.findAllByOrderByNameAsc().stream().map(this::toTagDto).toList();
    }

    public List<AdminOfferDto> listAllOffers() {
        return offerRepository.findAllByOrderByNameAsc().stream().map(this::toOfferDto).toList();
    }

    @Transactional
    public AdminFabricDto createFabric(UpsertFabricRequest request) {
        Fabric fabric = Fabric.builder()
                .id(UUID.randomUUID())
                .name(request.name().trim())
                .slug(resolveSlug(request.name(), request.slug()))
                .description(request.description())
                .composition(request.composition())
                .active(request.active() == null || request.active())
                .build();
        return toFabricDto(fabricRepository.save(fabric));
    }

    @Transactional
    public AdminFabricDto updateFabric(UUID id, UpsertFabricRequest request) {
        Fabric fabric = fabricRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fabric not found: " + id));
        fabric.setName(request.name().trim());
        fabric.setSlug(resolveSlug(request.name(), request.slug()));
        fabric.setDescription(request.description());
        fabric.setComposition(request.composition());
        if (request.active() != null) {
            fabric.setActive(request.active());
        }
        return toFabricDto(fabric);
    }

    @Transactional
    public void deactivateFabric(UUID id) {
        fabricRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fabric not found: " + id));
        int updated = fabricRepository.softDelete(id, Instant.now());
        if (updated == 0) {
            throw new ResourceNotFoundException("Fabric not found: " + id);
        }
    }

    @Transactional
    public AdminPrintDto createPrint(UpsertPrintRequest request) {
        Print print = Print.builder()
                .id(UUID.randomUUID())
                .name(request.name().trim())
                .slug(resolveSlug(request.name(), request.slug()))
                .description(request.description())
                .patternType(request.patternType())
                .active(request.active() == null || request.active())
                .build();
        return toPrintDto(printRepository.save(print));
    }

    @Transactional
    public AdminPrintDto updatePrint(UUID id, UpsertPrintRequest request) {
        Print print = printRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Print not found: " + id));
        print.setName(request.name().trim());
        print.setSlug(resolveSlug(request.name(), request.slug()));
        print.setDescription(request.description());
        print.setPatternType(request.patternType());
        if (request.active() != null) {
            print.setActive(request.active());
        }
        return toPrintDto(print);
    }

    @Transactional
    public void deactivatePrint(UUID id) {
        printRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Print not found: " + id));
        int updated = printRepository.softDelete(id, Instant.now());
        if (updated == 0) {
            throw new ResourceNotFoundException("Print not found: " + id);
        }
    }

    @Transactional
    public AdminTagDto createTag(UpsertTagRequest request) {
        Tag tag = Tag.builder()
                .id(UUID.randomUUID())
                .name(request.name().trim())
                .slug(resolveSlug(request.name(), request.slug()))
                .tagType(request.tagType() != null ? request.tagType() : TagType.GENERAL)
                .build();
        return toTagDto(tagRepository.save(tag));
    }

    @Transactional
    public AdminTagDto updateTag(UUID id, UpsertTagRequest request) {
        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tag not found: " + id));
        tag.setName(request.name().trim());
        tag.setSlug(resolveSlug(request.name(), request.slug()));
        if (request.tagType() != null) {
            tag.setTagType(request.tagType());
        }
        return toTagDto(tag);
    }

    @Transactional
    public void deactivateTag(UUID id) {
        tagRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tag not found: " + id));
        int updated = tagRepository.softDelete(id, Instant.now());
        if (updated == 0) {
            throw new ResourceNotFoundException("Tag not found: " + id);
        }
    }

    @Transactional
    public AdminOfferDto createOffer(UpsertOfferRequest request) {
        Offer offer = Offer.builder()
                .id(UUID.randomUUID())
                .name(request.name().trim())
                .code(request.code())
                .description(request.description())
                .discountType(request.discountType())
                .discountValue(request.discountValue())
                .startsAt(request.startsAt())
                .endsAt(request.endsAt())
                .active(request.active() == null || request.active())
                .build();
        return toOfferDto(offerRepository.save(offer));
    }

    @Transactional
    public AdminOfferDto updateOffer(UUID id, UpsertOfferRequest request) {
        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found: " + id));
        offer.setName(request.name().trim());
        offer.setCode(request.code());
        offer.setDescription(request.description());
        offer.setDiscountType(request.discountType());
        offer.setDiscountValue(request.discountValue());
        offer.setStartsAt(request.startsAt());
        offer.setEndsAt(request.endsAt());
        if (request.active() != null) {
            offer.setActive(request.active());
        }
        return toOfferDto(offer);
    }

    @Transactional
    public void deactivateOffer(UUID id) {
        offerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found: " + id));
        int updated = offerRepository.softDelete(id, Instant.now());
        if (updated == 0) {
            throw new ResourceNotFoundException("Offer not found: " + id);
        }
    }

    private static String resolveSlug(String name, String requestedSlug) {
        String slug = requestedSlug != null && !requestedSlug.isBlank()
                ? SlugUtils.toSlug(requestedSlug)
                : SlugUtils.toSlug(name);
        if (slug.isBlank()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Slug is required");
        }
        return slug;
    }

    private AdminFabricDto toFabricDto(Fabric fabric) {
        return new AdminFabricDto(
                fabric.getId(), fabric.getName(), fabric.getSlug(),
                fabric.getDescription(), fabric.getComposition(), fabric.isActive());
    }

    private AdminPrintDto toPrintDto(Print print) {
        return new AdminPrintDto(
                print.getId(), print.getName(), print.getSlug(),
                print.getDescription(), print.getPatternType(), print.isActive());
    }

    private AdminTagDto toTagDto(Tag tag) {
        return new AdminTagDto(tag.getId(), tag.getName(), tag.getSlug(), tag.getTagType());
    }

    private AdminOfferDto toOfferDto(Offer offer) {
        return new AdminOfferDto(
                offer.getId(), offer.getName(), offer.getCode(), offer.getDescription(),
                offer.getDiscountType(), offer.getDiscountValue(),
                offer.getStartsAt(), offer.getEndsAt(), offer.isActive());
    }
}
