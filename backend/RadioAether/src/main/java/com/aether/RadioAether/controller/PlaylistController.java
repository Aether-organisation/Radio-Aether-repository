package com.aether.RadioAether.controller;

import com.aether.RadioAether.model.dto.request.AddStationToPlaylistRequest;
import com.aether.RadioAether.model.dto.response.PlaylistDTO;
import com.aether.RadioAether.service.PlaylistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/playlists")
@RequiredArgsConstructor
public class PlaylistController {

    private final PlaylistService playlistService;

    @GetMapping
    public ResponseEntity<List<PlaylistDTO>> getUserPlaylists(Authentication authentication) {
        return ResponseEntity.ok(playlistService.getUserPlaylists(authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<PlaylistDTO> createPlaylist(
            @RequestBody CreatePlaylistRequest body,
            Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(playlistService.createPlaylist(authentication.getName(), body.name()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlaylist(
            @PathVariable String id,
            Authentication authentication) {
        playlistService.deletePlaylist(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlaylistDTO> getPlaylistById(
            @PathVariable String id,
            Authentication authentication) {
        return ResponseEntity.ok(playlistService.getPlaylistById(authentication.getName(), id));
    }

    @PostMapping("/{id}/stations")
    public ResponseEntity<PlaylistDTO> addStation(
            @PathVariable String id,
            @RequestBody AddStationToPlaylistRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(playlistService.addStation(authentication.getName(), id, request));
    }

    @Transactional
    @DeleteMapping("/{id}/stations/{stationId}")
    public ResponseEntity<Void> removeStation(
            @PathVariable String id,
            @PathVariable String stationId,
            Authentication authentication) {
        playlistService.removeStation(authentication.getName(), id, stationId);
        return ResponseEntity.noContent().build();
    }
}

record CreatePlaylistRequest(String name) {}
