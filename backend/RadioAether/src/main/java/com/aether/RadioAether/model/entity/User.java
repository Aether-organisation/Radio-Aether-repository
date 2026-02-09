package com.aether.RadioAether.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * User entity
 * @author prorix
 * @author mahoramas
 * @version 1.1.0
 */
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "USUARIOS")
public class User {

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

    @ManyToMany(fetch = FetchType.EAGER)
        @JoinTable(
        name = "USUARIOS_ROLES",
        joinColumns = @JoinColumn(name = "id_usuario"),
        inverseJoinColumns = @JoinColumn(name = "id_rol")
    )
    private Set<Role> roles = new HashSet<>();
}



