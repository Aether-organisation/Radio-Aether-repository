package com.aether.RadioAether.service;

import com.aether.RadioAether.model.dto.request.AddStationToPlaylistRequest;
import com.aether.RadioAether.model.dto.response.PlaylistDTO;
import com.aether.RadioAether.model.entity.Playlist;
import com.aether.RadioAether.model.entity.PlaylistStation;
import com.aether.RadioAether.model.entity.User;
import com.aether.RadioAether.repository.PlaylistRepository;
import com.aether.RadioAether.repository.PlaylistStationRepository;
import com.aether.RadioAether.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link PlaylistService}.
 * Covers playlist CRUD operations and authorization checks
 * that prevent users from accessing or modifying other users' playlists.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@ExtendWith(MockitoExtension.class)
class PlaylistServiceTest {

    @Mock
    private PlaylistRepository playlistRepository;

    @Mock
    private PlaylistStationRepository playlistStationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private PlaylistService playlistService;

    private static final String EMAIL = "user@radio.com";
    private static final String OTHER_EMAIL = "other@radio.com";
    private static final String PLAYLIST_ID = "playlist-001";

    private User mockUser;
    private User otherUser;
    private Playlist mockPlaylist;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .idUsuario(1L)
                .email(EMAIL)
                .nombre("TestUser")
                .activo(true)
                .build();

        otherUser = User.builder()
                .idUsuario(2L)
                .email(OTHER_EMAIL)
                .nombre("OtherUser")
                .activo(true)
                .build();

        mockPlaylist = Playlist.builder()
                .id(PLAYLIST_ID)
                .name("My Playlist")
                .user(mockUser)
                .createdAt(LocalDateTime.now())
                .stations(new ArrayList<>())
                .build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // getUserPlaylists
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("getUserPlaylists: returns list of playlists for the user")
    void getUserPlaylists_returnsList() {
        when(playlistRepository.findByUserEmailOrderByCreatedAtDesc(EMAIL))
                .thenReturn(List.of(mockPlaylist));

        List<PlaylistDTO> result = playlistService.getUserPlaylists(EMAIL);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(PLAYLIST_ID);
        assertThat(result.get(0).getName()).isEqualTo("My Playlist");
    }

    @Test
    @DisplayName("getUserPlaylists: returns empty list when user has no playlists")
    void getUserPlaylists_returnsEmptyList() {
        when(playlistRepository.findByUserEmailOrderByCreatedAtDesc(EMAIL))
                .thenReturn(List.of());

        List<PlaylistDTO> result = playlistService.getUserPlaylists(EMAIL);

        assertThat(result).isEmpty();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // createPlaylist
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("createPlaylist: creates and returns a new playlist")
    void createPlaylist_createsSuccessfully() {
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(mockUser));
        when(playlistRepository.save(any(Playlist.class))).thenAnswer(inv -> inv.getArgument(0));

        PlaylistDTO result = playlistService.createPlaylist(EMAIL, "Chill Vibes");

        assertThat(result.getName()).isEqualTo("Chill Vibes");
        assertThat(result.getId()).isNotNull();
    }

    @Test
    @DisplayName("createPlaylist: throws RuntimeException when user not found")
    void createPlaylist_throwsWhenUserNotFound() {
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> playlistService.createPlaylist(EMAIL, "Chill Vibes"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("User not found");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // deletePlaylist
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("deletePlaylist: deletes playlist when it belongs to the user")
    void deletePlaylist_deletesSuccessfully() {
        when(playlistRepository.existsByIdAndUserEmail(PLAYLIST_ID, EMAIL)).thenReturn(true);

        assertThatCode(() -> playlistService.deletePlaylist(EMAIL, PLAYLIST_ID))
                .doesNotThrowAnyException();

        verify(playlistRepository).deleteById(PLAYLIST_ID);
    }

    @Test
    @DisplayName("deletePlaylist: throws RuntimeException when playlist not found or unauthorized")
    void deletePlaylist_throwsWhenUnauthorized() {
        when(playlistRepository.existsByIdAndUserEmail(PLAYLIST_ID, OTHER_EMAIL)).thenReturn(false);

        assertThatThrownBy(() -> playlistService.deletePlaylist(OTHER_EMAIL, PLAYLIST_ID))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Playlist not found or unauthorized");

        verify(playlistRepository, never()).deleteById(any());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // getPlaylistById
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("getPlaylistById: returns playlist when it belongs to the user")
    void getPlaylistById_returnsPlaylist() {
        when(playlistRepository.findById(PLAYLIST_ID)).thenReturn(Optional.of(mockPlaylist));

        PlaylistDTO result = playlistService.getPlaylistById(EMAIL, PLAYLIST_ID);

        assertThat(result.getId()).isEqualTo(PLAYLIST_ID);
        assertThat(result.getName()).isEqualTo("My Playlist");
    }

    @Test
    @DisplayName("getPlaylistById: throws Unauthorized when accessed by wrong user")
    void getPlaylistById_throwsWhenUnauthorized() {
        when(playlistRepository.findById(PLAYLIST_ID)).thenReturn(Optional.of(mockPlaylist));

        assertThatThrownBy(() -> playlistService.getPlaylistById(OTHER_EMAIL, PLAYLIST_ID))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Unauthorized");
    }

    @Test
    @DisplayName("getPlaylistById: throws RuntimeException when playlist does not exist")
    void getPlaylistById_throwsWhenNotFound() {
        when(playlistRepository.findById("nonexistent")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> playlistService.getPlaylistById(EMAIL, "nonexistent"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Playlist not found");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // addStation
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("addStation: adds station to playlist successfully")
    void addStation_addsSuccessfully() {
        AddStationToPlaylistRequest request = new AddStationToPlaylistRequest();
        request.setStationId("station-x");
        request.setStationName("Radio X");
        request.setStreamUrl("https://stream.x.com");
        request.setLogoUrl("https://logo.x.com/img.png");
        request.setGenre("Rock");

        when(playlistRepository.findById(PLAYLIST_ID)).thenReturn(Optional.of(mockPlaylist));
        when(playlistStationRepository.existsByPlaylistIdAndStationId(PLAYLIST_ID, "station-x"))
                .thenReturn(false);
        when(playlistStationRepository.save(any(PlaylistStation.class)))
                .thenAnswer(inv -> inv.getArgument(0));
        when(playlistRepository.findById(PLAYLIST_ID)).thenReturn(Optional.of(mockPlaylist));

        PlaylistDTO result = playlistService.addStation(EMAIL, PLAYLIST_ID, request);

        verify(playlistStationRepository).save(any(PlaylistStation.class));
        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("addStation: skips save when station is already in playlist")
    void addStation_skipsWhenAlreadyPresent() {
        AddStationToPlaylistRequest request = new AddStationToPlaylistRequest();
        request.setStationId("station-x");
        request.setStationName("Radio X");
        request.setStreamUrl("https://stream.x.com");

        when(playlistRepository.findById(PLAYLIST_ID)).thenReturn(Optional.of(mockPlaylist));
        when(playlistStationRepository.existsByPlaylistIdAndStationId(PLAYLIST_ID, "station-x"))
                .thenReturn(true);

        PlaylistDTO result = playlistService.addStation(EMAIL, PLAYLIST_ID, request);

        verify(playlistStationRepository, never()).save(any());
        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("addStation: throws Unauthorized when accessed by wrong user")
    void addStation_throwsWhenUnauthorized() {
        AddStationToPlaylistRequest request = new AddStationToPlaylistRequest();
        request.setStationId("station-x");

        when(playlistRepository.findById(PLAYLIST_ID)).thenReturn(Optional.of(mockPlaylist));

        assertThatThrownBy(() -> playlistService.addStation(OTHER_EMAIL, PLAYLIST_ID, request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Unauthorized");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // removeStation
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("removeStation: removes station when playlist belongs to user")
    void removeStation_removesSuccessfully() {
        when(playlistRepository.existsByIdAndUserEmail(PLAYLIST_ID, EMAIL)).thenReturn(true);

        assertThatCode(() -> playlistService.removeStation(EMAIL, PLAYLIST_ID, "station-x"))
                .doesNotThrowAnyException();

        verify(playlistStationRepository).deleteByPlaylistIdAndStationId(PLAYLIST_ID, "station-x");
    }

    @Test
    @DisplayName("removeStation: throws RuntimeException when playlist not found or unauthorized")
    void removeStation_throwsWhenUnauthorized() {
        when(playlistRepository.existsByIdAndUserEmail(PLAYLIST_ID, OTHER_EMAIL)).thenReturn(false);

        assertThatThrownBy(() -> playlistService.removeStation(OTHER_EMAIL, PLAYLIST_ID, "station-x"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Playlist not found or unauthorized");

        verify(playlistStationRepository, never()).deleteByPlaylistIdAndStationId(any(), any());
    }
}
