package com.aether.RadioAether.runner;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.aether.RadioAether.model.entity.Role;
import com.aether.RadioAether.model.enums.RoleName;
import com.aether.RadioAether.repository.RoleRepository;

/**
 * Role initializer
 * @author prorix
 * @author mahoramas
 * @version 1.0
 */
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Override
    public void run(String... args) throws Exception {
        if (roleRepository.findByName(RoleName.ROLE_USER).isEmpty()) {
            roleRepository.save(Role.builder().name(RoleName.ROLE_USER).build());
        }
        if (roleRepository.findByName(RoleName.ROLE_ADMIN).isEmpty()) {
            roleRepository.save(Role.builder().name(RoleName.ROLE_ADMIN).build());
        }
        if (roleRepository.findByName(RoleName.ROLE_B2B).isEmpty()) {
            roleRepository.save(Role.builder().name(RoleName.ROLE_B2B).build());
        }
    }
}

