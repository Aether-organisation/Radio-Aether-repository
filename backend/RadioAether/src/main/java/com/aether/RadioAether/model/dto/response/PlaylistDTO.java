package com.aether.RadioAether.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlaylistDTO {

    private String id;
    private String name;
    private LocalDateTime createdAt;
    private List<PlaylistStationDTO> stations;
}
