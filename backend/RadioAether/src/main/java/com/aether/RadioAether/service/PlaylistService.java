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

@Service
@RequiredArgsConstructor
public class PlaylistService {

    private final PlaylistRepository playlistRepository;
    private final PlaylistStationRepository playlistStationRepository;
    private final UserRepository userRepository;

    public List<PlaylistDTO> getUserPlaylists(String email) {
        return playlistRepository.findByUserEmailOrderByCreatedAtDesc(email).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

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

    public void deletePlaylist(String email, String playlistId) {
        if (!playlistRepository.existsByIdAndUserEmail(playlistId, email)) {
            throw new RuntimeException("Playlist not found or unauthorized");
        }
        playlistRepository.deleteById(playlistId);
    }

    public PlaylistDTO getPlaylistById(String email, String playlistId) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new RuntimeException("Playlist not found"));
        if (!playlist.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized");
        }
        return toDTO(playlist);
    }

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

    @Transactional
    public void removeStation(String email, String playlistId, String stationId) {
        if (!playlistRepository.existsByIdAndUserEmail(playlistId, email)) {
            throw new RuntimeException("Playlist not found or unauthorized");
        }
        playlistStationRepository.deleteByPlaylistIdAndStationId(playlistId, stationId);
    }

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
