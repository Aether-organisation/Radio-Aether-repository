package com.aether.RadioAether.model.dto.request;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Request payload for submitting a featured station application.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeaturedStationRequestDTO {
    private String stationId;
    private String stationName;
    private String streamUrl;
    private String logoUrl;
    private String genre;
}
