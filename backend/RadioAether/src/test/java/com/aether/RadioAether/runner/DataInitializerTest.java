package com.aether.RadioAether.runner;

import com.aether.RadioAether.model.entity.Role;
import com.aether.RadioAether.model.enums.RoleName;
import com.aether.RadioAether.repository.RoleRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link DataInitializer}.
 * Verifies that missing roles are created on startup and existing ones are not duplicated.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@ExtendWith(MockitoExtension.class)
class DataInitializerTest {

    @Mock
    private RoleRepository roleRepository;

    @InjectMocks
    private DataInitializer dataInitializer;

    @Test
    @DisplayName("run: creates all three roles when none exist")
    void run_createsAllRolesWhenNoneExist() throws Exception {
        when(roleRepository.findByName(any())).thenReturn(Optional.empty());

        dataInitializer.run();

        ArgumentCaptor<Role> captor = ArgumentCaptor.forClass(Role.class);
        verify(roleRepository, times(3)).save(captor.capture());

        List<Role> saved = captor.getAllValues();
        assertThat(saved).extracting(Role::getName)
                .containsExactlyInAnyOrder(RoleName.ROLE_USER, RoleName.ROLE_ADMIN, RoleName.ROLE_B2B);
    }

    @Test
    @DisplayName("run: does not create ROLE_USER if it already exists")
    void run_doesNotCreateRoleUserWhenAlreadyPresent() throws Exception {
        Role existingUserRole = Role.builder().name(RoleName.ROLE_USER).build();
        when(roleRepository.findByName(RoleName.ROLE_USER)).thenReturn(Optional.of(existingUserRole));
        when(roleRepository.findByName(RoleName.ROLE_ADMIN)).thenReturn(Optional.empty());
        when(roleRepository.findByName(RoleName.ROLE_B2B)).thenReturn(Optional.empty());

        dataInitializer.run();

        ArgumentCaptor<Role> captor = ArgumentCaptor.forClass(Role.class);
        verify(roleRepository, times(2)).save(captor.capture());
        assertThat(captor.getAllValues()).extracting(Role::getName)
                .containsExactlyInAnyOrder(RoleName.ROLE_ADMIN, RoleName.ROLE_B2B)
                .doesNotContain(RoleName.ROLE_USER);
    }

    @Test
    @DisplayName("run: does not save anything when all roles already exist")
    void run_doesNothingWhenAllRolesPresent() throws Exception {
        when(roleRepository.findByName(RoleName.ROLE_USER))
                .thenReturn(Optional.of(Role.builder().name(RoleName.ROLE_USER).build()));
        when(roleRepository.findByName(RoleName.ROLE_ADMIN))
                .thenReturn(Optional.of(Role.builder().name(RoleName.ROLE_ADMIN).build()));
        when(roleRepository.findByName(RoleName.ROLE_B2B))
                .thenReturn(Optional.of(Role.builder().name(RoleName.ROLE_B2B).build()));

        dataInitializer.run();

        verify(roleRepository, never()).save(any());
    }
}
