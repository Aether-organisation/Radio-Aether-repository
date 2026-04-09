package com.aether.RadioAether.model.dto;

import lombok.Builder;
import lombok.Data;

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
