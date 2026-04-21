package com.aether.RadioAether.controller;

import com.aether.RadioAether.model.dto.response.MoodPlaylist;
import com.aether.RadioAether.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST endpoints for AI-powered playlist generation.
 *
 * POST /api/ai/mood        — Free text → Mood Tuner playlist
 * POST /api/ai/contextual  — Coordinates + time → Context-aware playlist
 */
@RestController
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    private record MoodRequest(String text) {}
    private record ContextualRequest(double latitude, double longitude, String localTime) {}

    @PostMapping("/api/ai/mood")
    public ResponseEntity<MoodPlaylist> getMoodPlaylist(@RequestBody MoodRequest request) {
        return ResponseEntity.ok(aiService.getMoodPlaylist(request.text()));
    }

    @PostMapping("/api/ai/contextual")
    public ResponseEntity<MoodPlaylist> getContextualPlaylist(@RequestBody ContextualRequest request) {
        return ResponseEntity.ok(
                aiService.getContextualPlaylist(request.latitude(), request.longitude(), request.localTime())
        );
    }
}
