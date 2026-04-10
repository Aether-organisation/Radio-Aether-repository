package com.aether.RadioAether.model.dto.request;

import lombok.Data;

@Data
public class FavoriteRequest {
    private String stationId;
    private String name;
    private String streamUrl;
    private String logoUrl;
    private String genre;
}
