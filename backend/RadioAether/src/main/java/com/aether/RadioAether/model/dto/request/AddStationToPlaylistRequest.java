package com.aether.RadioAether.model.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request payload for adding a station to a playlist.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddStationToPlaylistRequest {

    private String stationId;
    private String stationName;
    private String streamUrl;
    private String logoUrl;
    private String genre;
}
