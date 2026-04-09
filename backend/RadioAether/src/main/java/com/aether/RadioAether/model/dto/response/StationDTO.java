package com.aether.RadioAether.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


/**
 * DTO of the mocked station
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StationDTO {
    private String id;
    private String name;
    private String streamUrl;
    private String logoUrl;
    private String genre;
    private Double latitude;
    private Double longitude;
}

