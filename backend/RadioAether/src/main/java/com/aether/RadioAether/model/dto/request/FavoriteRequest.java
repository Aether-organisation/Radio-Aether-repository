package com.aether.RadioAether.model.dto.request;

import lombok.Data;

/**
 * Request payload for adding a favorite station.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@Data
public class FavoriteRequest {
    private String stationId;
    private String name;
    private String streamUrl;
    private String logoUrl;
    private String genre;
}
