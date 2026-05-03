package com.aether.RadioAether.model.dto;

import lombok.Builder;
import lombok.Data;

/**
 * Data Transfer Object representing a radio station in the application.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@Data
@Builder
public class StationDTO {

    private String id;
    private String name;
    private String streamUrl;
    private String codec;
    private String tags;
    private String favicon;

}
