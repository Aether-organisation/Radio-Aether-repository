package com.aether.RadioAether.model.dto.response;

import com.aether.RadioAether.model.dto.StationDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * Represents a single track or recommendation in an AI-generated mood playlist.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MoodPlaylist {
    private String title;
    private String description;
    private List<StationDTO> stations;
}
