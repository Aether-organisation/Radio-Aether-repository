package com.aether.RadioAether.repository;

import com.aether.RadioAether.model.entity.EmailVerificationCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Spring Data JPA repository for {@link EmailVerificationCode} entities.
 *
 * <p>Provides lookup and deletion by e-mail address to support the two-phase
 * email-verification flow used during user registration.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
public interface EmailVerificationCodeRepository extends JpaRepository<EmailVerificationCode, Long> {

    /**
     * Returns the pending verification code associated with the given e-mail address, if any.
     *
     * @param email the e-mail address to look up
     * @return an {@link Optional} containing the {@link EmailVerificationCode}, or empty
     */
    Optional<EmailVerificationCode> findByEmail(String email);

    /**
     * Deletes all verification codes associated with the given e-mail address.
     * Used to clean up after a successful registration or before issuing a new code.
     *
     * @param email the e-mail address whose codes should be removed
     */
    void deleteByEmail(String email);
}
