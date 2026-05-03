package com.aether.RadioAether.model.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * Response payload containing an AI-generated playlist and its summary.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
public class MoodPlaylistResponse {
    private String playlistTitle;
    private String playlistDescription;
    private List<String> tags;
    private List<String> genres;
    private String mood;
}
