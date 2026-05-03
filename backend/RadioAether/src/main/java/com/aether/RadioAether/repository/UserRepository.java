package com.aether.RadioAether.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.aether.RadioAether.model.entity.User;

/**
 * User JPA repository
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Looks up a user by their e-mail address.
     *
     * @param email the e-mail to search
     * @return an {@link Optional} containing the {@link User}, or empty if not found
     */
    Optional<User> findByEmail(String email);

    /**
     * Returns {@code true} if any user is registered with the given e-mail.
     *
     * @param email the e-mail to check
     * @return {@code true} if the e-mail is already taken
     */
    Boolean existsByEmail(String email);

    /**
     * Returns {@code true} if any user is registered with the given display name.
     *
     * @param nombre the display name to check
     * @return {@code true} if the name is already taken
     */
    Boolean existsByNombre(String nombre);
}

