package com.aether.RadioAether.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object representing a station inside a playlist.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlaylistStationDTO {

    private String id;
    private String stationId;
    private String stationName;
    private String streamUrl;
    private String logoUrl;
    private String genre;
}
