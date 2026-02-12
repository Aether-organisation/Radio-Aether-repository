package com.aether.RadioAether.model.entity;

import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


/**
 * Station entity
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@Builder
@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "EMISORAS")
public class Station {

    @Id
    @GeneratedValue(strategy=GenerationType.UUID)
    private UUID id;
    private String nombre;
    private String streamUrl;
    private String logoURL;
    private String generoPrincipal;
    private double latitud;
    private double longitud;
    private String pais;


}
