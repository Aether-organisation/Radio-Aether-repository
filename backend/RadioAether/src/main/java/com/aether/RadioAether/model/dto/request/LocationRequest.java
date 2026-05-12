package com.aether.RadioAether.model.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Current time user coordinates
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LocationRequest {

    private double latitude;
    private double longitude;

}
