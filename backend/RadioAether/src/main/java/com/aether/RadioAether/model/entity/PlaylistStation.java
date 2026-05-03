package com.aether.RadioAether.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity representing a radio station saved within a playlist.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "lista_emisoras")
public class PlaylistStation {

    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lista_id")
    private Playlist playlist;

    @Column(name = "station_id")
    private String stationId;

    @Column(name = "nombre")
    private String stationName;

    @Column(name = "stream_url", length = 1024)
    private String streamUrl;

    @Column(name = "logo_url", length = 1024)
    private String logoUrl;

    @Column(name = "genero")
    private String genre;

    @Column(name = "agregada_en")
    private LocalDateTime addedAt;
}
