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
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
    Boolean existsByNombre(String nombre);
}

