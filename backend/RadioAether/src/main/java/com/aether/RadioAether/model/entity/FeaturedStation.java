package com.aether.RadioAether.model.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Entity
@Table(name = "DESTACADOS")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeaturedStation {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "station_id")
    private String stationId;

    @Column(name = "station_name")
    private String stationName;

    @Column(name = "stream_url")
    private String streamUrl;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "genre")
    private String genre;

    @Column(name = "featured_from")
    private LocalDateTime featuredFrom;

    @Column(name = "featured_until")
    private LocalDateTime featuredUntil;

    @Column(name = "odoo_request_id")
    private String odooRequestId;

    @Column(name = "is_active")
    private boolean isActive;
}
