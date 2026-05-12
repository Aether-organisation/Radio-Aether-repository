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

/**
 * REST controller for managing user-created custom playlists.
 *
 * <p>All operations are scoped to the authenticated user — users cannot access
 * or modify playlists that belong to other accounts.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/playlists")
@RequiredArgsConstructor
public class PlaylistController {

    private final PlaylistService playlistService;

    /**
     * Returns all playlists owned by the authenticated user, ordered by creation date
     * (most recent first).
     *
     * @param authentication the current security context
     * @return a {@link ResponseEntity} containing the list of {@link PlaylistDTO}s
     */
    @GetMapping
    public ResponseEntity<List<PlaylistDTO>> getUserPlaylists(Authentication authentication) {
        return ResponseEntity.ok(playlistService.getUserPlaylists(authentication.getName()));
    }

    /**
     * Creates a new empty playlist for the authenticated user.
     *
     * @param body           record containing the playlist {@code name}
     * @param authentication the current security context
     * @return a {@link ResponseEntity} with HTTP 201 and the created {@link PlaylistDTO}
     */
    @PostMapping
    public ResponseEntity<PlaylistDTO> createPlaylist(
            @RequestBody CreatePlaylistRequest body,
            Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(playlistService.createPlaylist(authentication.getName(), body.name()));
    }

    /**
     * Deletes a playlist owned by the authenticated user.
     *
     * @param id             the UUID of the playlist to delete
     * @param authentication the current security context
     * @return an empty {@code 204 No Content} response
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlaylist(
            @PathVariable String id,
            Authentication authentication) {
        playlistService.deletePlaylist(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Returns a single playlist by its UUID.
     *
     * @param id             the UUID of the playlist to retrieve
     * @param authentication the current security context
     * @return a {@link ResponseEntity} containing the {@link PlaylistDTO}
     */
    @GetMapping("/{id}")
    public ResponseEntity<PlaylistDTO> getPlaylistById(
            @PathVariable String id,
            Authentication authentication) {
        return ResponseEntity.ok(playlistService.getPlaylistById(authentication.getName(), id));
    }

    /**
     * Adds a radio station to an existing playlist.
     * If the station is already in the playlist, the request is silently ignored.
     *
     * @param id             the UUID of the target playlist
     * @param request        DTO with the station metadata to add
     * @param authentication the current security context
     * @return a {@link ResponseEntity} containing the updated {@link PlaylistDTO}
     */
    @PostMapping("/{id}/stations")
    public ResponseEntity<PlaylistDTO> addStation(
            @PathVariable String id,
            @RequestBody AddStationToPlaylistRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(playlistService.addStation(authentication.getName(), id, request));
    }

    /**
     * Removes a station from a playlist.
     *
     * @param id             the UUID of the playlist
     * @param stationId      the external station ID to remove
     * @param authentication the current security context
     * @return an empty {@code 204 No Content} response
     */
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

/**
 * Internal record used as the request body for playlist creation.
 *
 * @param name the desired name for the new playlist
 */
record CreatePlaylistRequest(String name) {}
