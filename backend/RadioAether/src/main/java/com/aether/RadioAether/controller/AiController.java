package com.aether.RadioAether.controller;

import com.aether.RadioAether.model.dto.response.MoodPlaylist;
import com.aether.RadioAether.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for AI-powered playlist generation.
 *
 * <p>Exposes two endpoints:
 * <ul>
 *   <li>{@code POST /api/ai/mood} — generates a playlist from a free-text mood description.</li>
 *   <li>{@code POST /api/ai/contextual} — generates a context-aware playlist based on
 *       geographic coordinates and the local time of day.</li>
 * </ul>
 *
 * @author prorix
 * @author mahoramas
 * @version 1.1.0
 */
@RestController
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    /** Request body for the mood-tuner endpoint. */
    private record MoodRequest(String text) {}

    /** Request body for the contextual-playlist endpoint. */
    private record ContextualRequest(double latitude, double longitude, String localTime) {}

    /**
     * Generates a radio playlist based on a free-text mood or activity description.
     *
     * @param request body containing the user's mood text
     * @return a {@link ResponseEntity} wrapping the generated {@link MoodPlaylist}
     */
    @PostMapping("/api/ai/mood")
    public ResponseEntity<MoodPlaylist> getMoodPlaylist(@RequestBody MoodRequest request) {
        return ResponseEntity.ok(aiService.getMoodPlaylist(request.text()));
    }

    /**
     * Generates a context-aware playlist using the user's current geographic position and
     * local time of day. Weather conditions are fetched automatically from the coordinates.
     *
     * @param request body containing {@code latitude}, {@code longitude} and
     *                {@code localTime} in {@code HH:mm} format
     * @return a {@link ResponseEntity} wrapping the generated {@link MoodPlaylist}
     */
    @PostMapping("/api/ai/contextual")
    public ResponseEntity<MoodPlaylist> getContextualPlaylist(@RequestBody ContextualRequest request) {
        return ResponseEntity.ok(
                aiService.getContextualPlaylist(request.latitude(), request.longitude(), request.localTime())
        );
    }
}
