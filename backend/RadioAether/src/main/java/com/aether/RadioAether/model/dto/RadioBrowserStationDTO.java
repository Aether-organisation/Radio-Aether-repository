package com.aether.RadioAether.model.dto;

import lombok.Data;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
public class RadioBrowserStationDTO {

    private String stationuuid;
    private String name;
    @JsonProperty("url_resolved")
    private String urlResolved;
    private String codec;
    private String tags;
    private String favicon;
    @JsonProperty("geo_lat")
    private Double geoLat;
    @JsonProperty("geo_long")
    private Double geoLong;

}
