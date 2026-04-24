package com.aether.RadioAether.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
