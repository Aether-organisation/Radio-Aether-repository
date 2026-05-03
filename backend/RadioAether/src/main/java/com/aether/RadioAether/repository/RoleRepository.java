package com.aether.RadioAether.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.aether.RadioAether.model.entity.Role;
import com.aether.RadioAether.model.enums.RoleName;

/**
 * JPA Repository of roles
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
public interface RoleRepository extends JpaRepository<Role, Integer> {

    /**
     * Looks up a role by its name constant.
     *
     * @param name the {@link RoleName} enum value to search
     * @return an {@link Optional} containing the {@link Role}, or empty if not found
     */
    Optional<Role> findByName(RoleName name);
}

