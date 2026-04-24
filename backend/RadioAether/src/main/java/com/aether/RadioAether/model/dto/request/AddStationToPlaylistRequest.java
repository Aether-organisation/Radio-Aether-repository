package com.aether.RadioAether.model.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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
