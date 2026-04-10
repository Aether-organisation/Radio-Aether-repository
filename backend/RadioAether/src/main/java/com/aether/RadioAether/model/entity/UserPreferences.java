package com.aether.RadioAether.model.entity;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;
import lombok.*;

/**
 * User preferences entity
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "PREFERENCIAS_USUARIO")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPreferences {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(name = "genero")
    private String genero;

    @ElementCollection
    @CollectionTable(name = "GENEROS_FAVORITOS", joinColumns = @JoinColumn(name = "id_preferencias"))
    @Column(name = "genero_musical")
    private List<String> favoriteGenres = new ArrayList<>();
}
