package com.gamyacouture.customer.application;

import com.gamyacouture.auth.application.SessionService;
import com.gamyacouture.auth.domain.UserAccount;
import com.gamyacouture.auth.infrastructure.UserAccountJpaRepository;
import com.gamyacouture.customer.api.dto.AddressDto;
import com.gamyacouture.customer.api.dto.ChangePasswordRequest;
import com.gamyacouture.customer.api.dto.CustomerProfileDto;
import com.gamyacouture.customer.api.dto.UpdateCustomerProfileRequest;
import com.gamyacouture.customer.api.dto.UpsertAddressRequest;
import com.gamyacouture.customer.domain.Address;
import com.gamyacouture.customer.domain.Customer;
import com.gamyacouture.customer.infrastructure.AddressJpaRepository;
import com.gamyacouture.customer.infrastructure.CustomerJpaRepository;
import com.gamyacouture.customer.infrastructure.mapper.CustomerMapper;
import com.gamyacouture.shared.exception.BusinessException;
import com.gamyacouture.shared.exception.ErrorCode;
import com.gamyacouture.shared.exception.ResourceNotFoundException;
import com.gamyacouture.shared.security.CurrentUserProvider;
import com.gamyacouture.shared.util.PhoneNormalizer;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class CustomerProfileService {

    private final CustomerJpaRepository customerRepository;
    private final AddressJpaRepository addressRepository;
    private final UserAccountJpaRepository userRepository;
    private final CustomerMapper customerMapper;
    private final CurrentUserProvider currentUserProvider;
    private final PasswordEncoder passwordEncoder;
    private final SessionService sessionService;

    @Transactional(readOnly = true)
    public CustomerProfileDto getProfile() {
        return customerMapper.toProfileDto(requireCustomer());
    }

    public CustomerProfileDto updateProfile(UpdateCustomerProfileRequest request) {
        Customer customer = requireCustomer();
        UserAccount user = customer.getUser();

        if (request.firstName() != null && !request.firstName().isBlank()) {
            customer.setFirstName(request.firstName().trim());
            user.setFirstName(request.firstName().trim());
        }
        if (request.lastName() != null && !request.lastName().isBlank()) {
            customer.setLastName(request.lastName().trim());
            user.setLastName(request.lastName().trim());
        }
        if (request.email() != null && !request.email().isBlank()) {
            String email = request.email().trim().toLowerCase();
            if (!email.equalsIgnoreCase(user.getEmail()) && userRepository.existsByEmailIgnoreCase(email)) {
                throw new BusinessException(ErrorCode.CONFLICT, "Email already in use");
            }
            customer.setEmail(email);
            user.setEmail(email);
        }
        if (request.phone() != null && !request.phone().isBlank()) {
            String phone = PhoneNormalizer.normalize(request.phone());
            if (!phone.equals(user.getPhone()) && userRepository.existsByPhone(phone)) {
                throw new BusinessException(ErrorCode.CONFLICT, "Phone already in use");
            }
            customer.setPhone(phone);
            user.setPhone(phone);
        }

        userRepository.save(user);
        customerRepository.save(customer);
        return getProfile();
    }

    public void changePassword(ChangePasswordRequest request) {
        UserAccount user = currentUserProvider.getCurrentAccount();
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);
        sessionService.revokeAllForUser(user.getId());
    }

    @Transactional(readOnly = true)
    public List<AddressDto> listAddresses() {
        Customer customer = requireCustomer();
        return addressRepository.findByCustomerIdAndDeletedAtIsNullOrderByIsDefaultDescCreatedAtAsc(customer.getId())
                .stream()
                .map(customerMapper::toAddressDto)
                .toList();
    }

    public AddressDto addAddress(UpsertAddressRequest request) {
        Customer customer = requireCustomer();
        if (Boolean.TRUE.equals(request.isDefault())) {
            clearDefault(customer.getId());
        }
        Address address = Address.builder()
                .id(UUID.randomUUID())
                .customer(customer)
                .addressType(request.addressType() != null
                        ? request.addressType()
                        : com.gamyacouture.customer.domain.AddressType.SHIPPING)
                .line1(request.line1().trim())
                .line2(blankToNull(request.line2()))
                .city(request.city().trim())
                .state(blankToNull(request.state()))
                .postalCode(blankToNull(request.postalCode()))
                .country(request.country() != null ? request.country() : "IN")
                .isDefault(Boolean.TRUE.equals(request.isDefault()) || customer.getAddresses().isEmpty())
                .build();
        addressRepository.save(address);
        return customerMapper.toAddressDto(address);
    }

    public AddressDto updateAddress(UUID addressId, UpsertAddressRequest request) {
        Customer customer = requireCustomer();
        Address address = addressRepository.findById(addressId)
                .filter(a -> a.getCustomer().getId().equals(customer.getId()) && a.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found: " + addressId));

        if (Boolean.TRUE.equals(request.isDefault())) {
            clearDefault(customer.getId());
        }
        address.setLine1(request.line1().trim());
        address.setLine2(blankToNull(request.line2()));
        address.setCity(request.city().trim());
        address.setState(blankToNull(request.state()));
        address.setPostalCode(blankToNull(request.postalCode()));
        if (request.country() != null) {
            address.setCountry(request.country());
        }
        if (request.isDefault() != null) {
            address.setDefault(request.isDefault());
        }
        addressRepository.save(address);
        return customerMapper.toAddressDto(address);
    }

    public void deleteAddress(UUID addressId) {
        Customer customer = requireCustomer();
        Address address = addressRepository.findById(addressId)
                .filter(a -> a.getCustomer().getId().equals(customer.getId()) && a.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found: " + addressId));
        address.setDeletedAt(Instant.now());
        addressRepository.save(address);
    }

    private void clearDefault(UUID customerId) {
        addressRepository.findByCustomerIdAndDeletedAtIsNullOrderByIsDefaultDescCreatedAtAsc(customerId)
                .forEach(a -> {
                    a.setDefault(false);
                    addressRepository.save(a);
                });
    }

    private Customer requireCustomer() {
        UUID userId = currentUserProvider.getCurrentUserId();
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found"));
        customer.getAddresses().size();
        return customer;
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
