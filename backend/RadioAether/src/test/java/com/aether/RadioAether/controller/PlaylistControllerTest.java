package com.aether.RadioAether.controller;

import com.aether.RadioAether.model.dto.request.AddStationToPlaylistRequest;
import com.aether.RadioAether.model.dto.response.PlaylistDTO;
import com.aether.RadioAether.service.PlaylistService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link PlaylistController}.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@ExtendWith(MockitoExtension.class)
class PlaylistControllerTest {

    @Mock
    private PlaylistService playlistService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private PlaylistController playlistController;

    private PlaylistDTO samplePlaylist;

    @BeforeEach
    void setUp() {
        when(authentication.getName()).thenReturn("user@example.com");
        samplePlaylist = PlaylistDTO.builder()
                .id("pl-1")
                .name("My Playlist")
                .build();
    }

    @Test
    @DisplayName("getUserPlaylists: returns 200 with the user's playlist list")
    void getUserPlaylists_returns200() {
        when(playlistService.getUserPlaylists("user@example.com"))
                .thenReturn(List.of(samplePlaylist));

        ResponseEntity<List<PlaylistDTO>> response =
                playlistController.getUserPlaylists(authentication);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsExactly(samplePlaylist);
    }

    @Test
    @DisplayName("createPlaylist: returns 201 Created with the new playlist")
    void createPlaylist_returns201() {
        when(playlistService.createPlaylist("user@example.com", "My Playlist"))
                .thenReturn(samplePlaylist);

        ResponseEntity<PlaylistDTO> response = playlistController.createPlaylist(
                new CreatePlaylistRequest("My Playlist"), authentication);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isEqualTo(samplePlaylist);
    }

    @Test
    @DisplayName("deletePlaylist: returns 204 No Content after deletion")
    void deletePlaylist_returns204() {
        ResponseEntity<Void> response = playlistController.deletePlaylist("pl-1", authentication);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(playlistService).deletePlaylist("user@example.com", "pl-1");
    }

    @Test
    @DisplayName("getPlaylistById: returns 200 with the playlist")
    void getPlaylistById_returns200() {
        when(playlistService.getPlaylistById("user@example.com", "pl-1"))
                .thenReturn(samplePlaylist);

        ResponseEntity<PlaylistDTO> response =
                playlistController.getPlaylistById("pl-1", authentication);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(samplePlaylist);
    }

    @Test
    @DisplayName("addStation: returns 200 with updated playlist")
    void addStation_returns200() {
        AddStationToPlaylistRequest request = new AddStationToPlaylistRequest(
                "s1", "Radio Test", "https://stream.test.com", null, "Pop");
        when(playlistService.addStation("user@example.com", "pl-1", request))
                .thenReturn(samplePlaylist);

        ResponseEntity<PlaylistDTO> response =
                playlistController.addStation("pl-1", request, authentication);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(samplePlaylist);
    }

    @Test
    @DisplayName("removeStation: returns 204 No Content after removal")
    void removeStation_returns204() {
        ResponseEntity<Void> response =
                playlistController.removeStation("pl-1", "s1", authentication);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(playlistService).removeStation("user@example.com", "pl-1", "s1");
    }
}
