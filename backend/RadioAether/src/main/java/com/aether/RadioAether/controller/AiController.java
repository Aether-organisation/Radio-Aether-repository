package com.aether.RadioAether.controller;

import com.aether.RadioAether.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    private record MoodRequest(String text) {}
    private record ContextualRequest(double latitude, double longitude, String localTime) {}

    @PostMapping("/api/ai/mood")
    public ResponseEntity<String> getMoodPlaylist(@RequestBody MoodRequest request) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body("Not implemented yet");
    }

    @PostMapping("/api/ai/contextual")
    public ResponseEntity<String> getContextualPlaylist(@RequestBody ContextualRequest request) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body("Not implemented yet");
    }
}
