package com.aether.RadioAether.model.entity;

import com.aether.RadioAether.model.enums.RoleName;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for the hand-written {@link org.springframework.security.core.userdetails.UserDetails}
 * interface methods defined directly in {@link User}.
 *
 * <p>Lombok-generated getters/setters are not exercised here since JaCoCo recognises
 * the {@code @lombok.Generated} annotation and skips them automatically.
 * These tests target only the business-logic methods written by hand:
 * {@code getAuthorities()}, {@code getUsername()}, {@code isEnabled()},
 * {@code isAccountNonExpired()}, {@code isAccountNonLocked()}, and
 * {@code isCredentialsNonExpired()}.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
class UserEntityTest {

    // ─────────────────────────────────────────────────────────────────────────
    // getAuthorities
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("getAuthorities: maps a single role to a SimpleGrantedAuthority")
    void getAuthorities_mapsRoleToAuthority() {
        Role role = Role.builder().name(RoleName.ROLE_USER).build();
        User user = User.builder()
                .email("test@example.com")
                .activo(true)
                .roles(new HashSet<>(Set.of(role)))
                .build();

        Collection<? extends GrantedAuthority> authorities = user.getAuthorities();

        assertThat(authorities).hasSize(1);
        assertThat(authorities.iterator().next().getAuthority()).isEqualTo("ROLE_USER");
    }

    @Test
    @DisplayName("getAuthorities: maps multiple roles to corresponding authorities")
    void getAuthorities_mapsMultipleRoles() {
        Role userRole = Role.builder().name(RoleName.ROLE_USER).build();
        Role adminRole = Role.builder().name(RoleName.ROLE_ADMIN).build();
        User user = User.builder()
                .email("admin@example.com")
                .activo(true)
                .roles(new HashSet<>(Set.of(userRole, adminRole)))
                .build();

        Collection<? extends GrantedAuthority> authorities = user.getAuthorities();

        assertThat(authorities).hasSize(2);
        assertThat(authorities)
                .extracting(GrantedAuthority::getAuthority)
                .containsExactlyInAnyOrder("ROLE_USER", "ROLE_ADMIN");
    }

    @Test
    @DisplayName("getAuthorities: returns empty collection when user has no roles")
    void getAuthorities_returnsEmptyWhenNoRoles() {
        User user = User.builder()
                .email("noroles@example.com")
                .roles(new HashSet<>())
                .build();

        assertThat(user.getAuthorities()).isEmpty();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // getUsername
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("getUsername: returns the user's email address")
    void getUsername_returnsEmail() {
        User user = User.builder().email("user@radio.com").build();
        assertThat(user.getUsername()).isEqualTo("user@radio.com");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // isEnabled
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("isEnabled: returns true when activo is true")
    void isEnabled_returnsTrueWhenActivo() {
        User user = User.builder().email("active@example.com").activo(true).build();
        assertThat(user.isEnabled()).isTrue();
    }

    @Test
    @DisplayName("isEnabled: returns false when activo is false")
    void isEnabled_returnsFalseWhenInactive() {
        User user = User.builder().email("inactive@example.com").activo(false).build();
        assertThat(user.isEnabled()).isFalse();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Account status methods — all always return true
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("isAccountNonExpired: always returns true")
    void isAccountNonExpired_alwaysReturnsTrue() {
        User user = User.builder().email("test@example.com").build();
        assertThat(user.isAccountNonExpired()).isTrue();
    }

    @Test
    @DisplayName("isAccountNonLocked: always returns true")
    void isAccountNonLocked_alwaysReturnsTrue() {
        User user = User.builder().email("test@example.com").build();
        assertThat(user.isAccountNonLocked()).isTrue();
    }

    @Test
    @DisplayName("isCredentialsNonExpired: always returns true")
    void isCredentialsNonExpired_alwaysReturnsTrue() {
        User user = User.builder().email("test@example.com").build();
        assertThat(user.isCredentialsNonExpired()).isTrue();
    }
}
