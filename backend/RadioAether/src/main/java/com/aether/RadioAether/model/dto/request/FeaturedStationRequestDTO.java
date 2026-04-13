package com.aether.RadioAether.model.dto.request;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

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
