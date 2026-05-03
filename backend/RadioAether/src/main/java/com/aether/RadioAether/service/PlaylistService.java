package com.aether.RadioAether.service;

import com.aether.RadioAether.model.dto.request.AddStationToPlaylistRequest;
import com.aether.RadioAether.model.dto.response.PlaylistDTO;
import com.aether.RadioAether.model.dto.response.PlaylistStationDTO;
import com.aether.RadioAether.model.entity.Playlist;
import com.aether.RadioAether.model.entity.PlaylistStation;
import com.aether.RadioAether.model.entity.User;
import com.aether.RadioAether.repository.PlaylistRepository;
import com.aether.RadioAether.repository.PlaylistStationRepository;
import com.aether.RadioAether.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service layer for managing user-created custom playlists.
 *
 * <p>All write operations verify that the caller owns the target playlist before
 * making any changes, throwing {@link RuntimeException} on ownership violations.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@Service
@RequiredArgsConstructor
public class PlaylistService {

    private final PlaylistRepository playlistRepository;
    private final PlaylistStationRepository playlistStationRepository;
    private final UserRepository userRepository;

    /**
     * Returns all playlists owned by the given user, ordered by creation date descending.
     *
     * @param email the authenticated user's e-mail address
     * @return a list of {@link PlaylistDTO}s; never {@code null}
     */
    public List<PlaylistDTO> getUserPlaylists(String email) {
        return playlistRepository.findByUserEmailOrderByCreatedAtDesc(email).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Creates a new empty playlist for the given user.
     *
     * @param email the authenticated user's e-mail address
     * @param name  the desired name for the playlist
     * @return the persisted {@link PlaylistDTO}
     * @throws RuntimeException if no user with the given e-mail exists
     */
    public PlaylistDTO createPlaylist(String email, String name) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Playlist playlist = Playlist.builder()
                .id(UUID.randomUUID().toString())
                .user(user)
                .name(name)
                .createdAt(LocalDateTime.now())
                .build();

        return toDTO(playlistRepository.save(playlist));
    }

    /**
     * Deletes a playlist owned by the given user.
     *
     * @param email      the authenticated user's e-mail address
     * @param playlistId the UUID of the playlist to delete
     * @throws RuntimeException if the playlist is not found or does not belong to the user
     */
    public void deletePlaylist(String email, String playlistId) {
        if (!playlistRepository.existsByIdAndUserEmail(playlistId, email)) {
            throw new RuntimeException("Playlist not found or unauthorized");
        }
        playlistRepository.deleteById(playlistId);
    }

    /**
     * Returns a single playlist by its UUID, verifying ownership.
     *
     * @param email      the authenticated user's e-mail address
     * @param playlistId the UUID of the playlist to retrieve
     * @return the {@link PlaylistDTO} for the requested playlist
     * @throws RuntimeException if the playlist is not found or does not belong to the user
     */
    public PlaylistDTO getPlaylistById(String email, String playlistId) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new RuntimeException("Playlist not found"));
        if (!playlist.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized");
        }
        return toDTO(playlist);
    }

    /**
     * Adds a radio station to a playlist.
     * If the station is already in the playlist, the current state is returned without changes.
     *
     * @param email      the authenticated user's e-mail address
     * @param playlistId the UUID of the target playlist
     * @param request    DTO with the station metadata to add
     * @return the updated {@link PlaylistDTO}
     * @throws RuntimeException if the playlist is not found or does not belong to the user
     */
    public PlaylistDTO addStation(String email, String playlistId, AddStationToPlaylistRequest request) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new RuntimeException("Playlist not found"));
        if (!playlist.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized");
        }
        if (playlistStationRepository.existsByPlaylistIdAndStationId(playlistId, request.getStationId())) {
            return toDTO(playlist);
        }
        PlaylistStation station = PlaylistStation.builder()
                .id(UUID.randomUUID().toString())
                .playlist(playlist)
                .stationId(request.getStationId())
                .stationName(request.getStationName())
                .streamUrl(request.getStreamUrl())
                .logoUrl(request.getLogoUrl())
                .genre(request.getGenre())
                .addedAt(LocalDateTime.now())
                .build();
        playlistStationRepository.save(station);
        return toDTO(playlistRepository.findById(playlistId).orElseThrow());
    }

    /**
     * Removes a station from a playlist.
     *
     * @param email      the authenticated user's e-mail address
     * @param playlistId the UUID of the playlist
     * @param stationId  the external station identifier to remove
     * @throws RuntimeException if the playlist is not found or does not belong to the user
     */
    @Transactional
    public void removeStation(String email, String playlistId, String stationId) {
        if (!playlistRepository.existsByIdAndUserEmail(playlistId, email)) {
            throw new RuntimeException("Playlist not found or unauthorized");
        }
        playlistStationRepository.deleteByPlaylistIdAndStationId(playlistId, stationId);
    }

    /**
     * Converts a {@link Playlist} JPA entity to its DTO representation.
     *
     * @param p the playlist entity to convert
     * @return the populated {@link PlaylistDTO}
     */
    private PlaylistDTO toDTO(Playlist p) {
        List<PlaylistStationDTO> stations = p.getStations().stream()
                .map(s -> PlaylistStationDTO.builder()
                        .id(s.getId())
                        .stationId(s.getStationId())
                        .stationName(s.getStationName())
                        .streamUrl(s.getStreamUrl())
                        .logoUrl(s.getLogoUrl())
                        .genre(s.getGenre())
                        .build())
                .collect(Collectors.toList());

        return PlaylistDTO.builder()
                .id(p.getId())
                .name(p.getName())
                .createdAt(p.getCreatedAt())
                .stations(stations)
                .build();
    }
}
