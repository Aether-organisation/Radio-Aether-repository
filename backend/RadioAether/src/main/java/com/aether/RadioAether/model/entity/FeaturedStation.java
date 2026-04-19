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
import com.fasterxml.jackson.annotation.JsonProperty;

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
    @JsonProperty("stationId")
    private String stationId;

    @Column(name = "station_name")
    @JsonProperty("name")
    private String stationName;

    @Column(name = "stream_url")
    @JsonProperty("streamUrl")
    private String streamUrl;

    @Column(name = "logo_url")
    @JsonProperty("logoUrl")
    private String logoUrl;

    @Column(name = "genre")
    @JsonProperty("genre")
    private String genre;

    @Column(name = "featured_from")
    @JsonProperty("featuredFrom")
    private LocalDateTime featuredFrom;

    @Column(name = "featured_until")
    @JsonProperty("featuredUntil")
    private LocalDateTime featuredUntil;

    @Column(name = "odoo_request_id")
    @JsonProperty("odooRequestId")
    private String odooRequestId;

    @Column(name = "is_active")
    @JsonProperty("isActive")
    private boolean isActive;
}
