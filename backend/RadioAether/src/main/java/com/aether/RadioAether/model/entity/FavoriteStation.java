package com.aether.RadioAether.model.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Stores a user's favourite radio station snapshot.
 * Station data is copied from RadioBrowser so favourites survive external changes.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "FAVORITOS",
       uniqueConstraints = @UniqueConstraint(columnNames = {"id_usuario", "station_id"}))
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FavoriteStation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private User user;

    @Column(name = "station_id", nullable = false)
    private String stationId;

    @Column(name = "nombre")
    private String name;

    @Column(name = "stream_url", length = 1024)
    private String streamUrl;

    @Column(name = "logo_url", length = 1024)
    private String logoUrl;

    @Column(name = "genero_musical")
    private String genre;
}
