package com.aether.RadioAether.model.entity;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;


import jakarta.persistence.*;
import lombok.*;

import com.aether.RadioAether.model.entity.UserPreferences;

/**
 * User entity
 * 
 * @author prorix
 * @author mahoramas 
 * @version 1.1.0
 */
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "USUARIOS")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long idUsuario;

    private String nombre;

    @Column(unique = true)
    private String email;

    private String password;
    private LocalDateTime fechaRegistro;
    
    private boolean activo;

    @Column(name = "encuesta_completada", nullable = false)
    private boolean surveyCompleted = false;

    @Column(name = "genero")
    private String genero;
    
    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "id_preferencias")
    private UserPreferences preferences;
    
    @Lob
    @Column(name="foto_perfil")
    private String fotoPerfil;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "USUARIOS_ROLES", joinColumns = @JoinColumn(name = "id_usuario"), inverseJoinColumns = @JoinColumn(name = "id_rol"))
    private Set<Role> roles = new HashSet<>();

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream()
            .map(role -> new SimpleGrantedAuthority(role.getName().name()))
            .collect(Collectors.toList());
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return this.activo;
    }
}
