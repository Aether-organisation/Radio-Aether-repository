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
    Optional<Role> findByName(RoleName name);
}

