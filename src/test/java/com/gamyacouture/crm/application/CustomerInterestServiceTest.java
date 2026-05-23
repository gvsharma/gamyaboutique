package com.gamyacouture.crm.application;

import com.gamyacouture.crm.api.dto.CreateInterestRequest;
import com.gamyacouture.crm.api.dto.InterestListFilter;
import com.gamyacouture.crm.api.dto.UpdateInterestStatusRequest;
import com.gamyacouture.crm.domain.CustomerInterest;
import com.gamyacouture.crm.domain.CustomerInterestStatus;
import com.gamyacouture.crm.infrastructure.CustomerInterestJpaRepository;
import com.gamyacouture.crm.infrastructure.mapper.CustomerInterestMapper;
import com.gamyacouture.crm.infrastructure.persistence.CustomerInterestSpecifications;
import com.gamyacouture.customer.infrastructure.CustomerJpaRepository;
import com.gamyacouture.product.api.event.ProductInterestSubmittedEvent;
import com.gamyacouture.product.domain.Product;
import com.gamyacouture.product.domain.ProductStatus;
import com.gamyacouture.product.infrastructure.ProductJpaRepository;
import com.gamyacouture.shared.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomerInterestServiceTest {

    @Mock
    private ProductJpaRepository productRepository;

    @Mock
    private CustomerInterestJpaRepository interestRepository;

    @Mock
    private CustomerJpaRepository customerRepository;

    @Mock
    private CustomerInterestMapper interestMapper;

    @Mock
    private CustomerInterestAuditService auditService;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private CustomerInterestService customerInterestService;

    @Test
    void create_persistsInterestAndPublishesEvent() {
        UUID productId = UUID.randomUUID();
        Product product = Product.builder().id(productId).name("Silk Saree").sku("SKU-001").build();

        when(productRepository.findByIdAndStatus(productId, ProductStatus.ACTIVE))
                .thenReturn(Optional.of(product));
        when(interestRepository.save(any(CustomerInterest.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = customerInterestService.create(new CreateInterestRequest(
                productId,
                "Priya Sharma",
                "+919876543210",
                "+919876543210",
                "M",
                "Maroon",
                "Wedding enquiry"));

        assertThat(response.id()).isNotNull();

        ArgumentCaptor<CustomerInterest> savedCaptor = ArgumentCaptor.forClass(CustomerInterest.class);
        verify(interestRepository).save(savedCaptor.capture());
        CustomerInterest saved = savedCaptor.getValue();
        assertThat(saved.getCustomerName()).isEqualTo("Priya Sharma");
        assertThat(saved.getStatus()).isEqualTo(CustomerInterestStatus.NEW);
        assertThat(saved.getSize()).isEqualTo("M");

        verify(auditService).logCreated(saved);

        ArgumentCaptor<ProductInterestSubmittedEvent> eventCaptor =
                ArgumentCaptor.forClass(ProductInterestSubmittedEvent.class);
        verify(eventPublisher).publishEvent(eventCaptor.capture());
        assertThat(eventCaptor.getValue().customerName()).isEqualTo("Priya Sharma");
        assertThat(eventCaptor.getValue().productId()).isEqualTo(productId);
    }

    @Test
    void create_throwsWhenProductMissing() {
        UUID productId = UUID.randomUUID();
        when(productRepository.findByIdAndStatus(productId, ProductStatus.ACTIVE))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> customerInterestService.create(new CreateInterestRequest(
                productId,
                "Priya Sharma",
                "+919876543210",
                null,
                null,
                null,
                null)))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void updateStatus_changesStatusAndAudits() {
        UUID id = UUID.randomUUID();
        CustomerInterest interest = CustomerInterest.builder()
                .id(id)
                .status(CustomerInterestStatus.NEW)
                .build();

        when(interestRepository.findById(id)).thenReturn(Optional.of(interest));
        when(interestRepository.save(interest)).thenReturn(interest);

        customerInterestService.updateStatus(
                id, new UpdateInterestStatusRequest(CustomerInterestStatus.CONTACTED, "Called"));

        assertThat(interest.getStatus()).isEqualTo(CustomerInterestStatus.CONTACTED);
        verify(auditService).logStatusChange(
                interest,
                CustomerInterestStatus.NEW,
                CustomerInterestStatus.CONTACTED,
                "Called");
    }

    @Test
    void list_usesSpecificationFilter() {
        when(interestRepository.findAll(any(Specification.class), any(PageRequest.class)))
                .thenReturn(new PageImpl<>(java.util.List.of()));

        customerInterestService.list(
                new InterestListFilter(null, null, CustomerInterestStatus.NEW, null, null),
                PageRequest.of(0, 20));

        verify(interestRepository).findAll(any(Specification.class), any(PageRequest.class));
        assertThat(CustomerInterestSpecifications.fromFilter(
                new InterestListFilter(null, null, CustomerInterestStatus.NEW, null, null)))
                .isNotNull();
    }
}
