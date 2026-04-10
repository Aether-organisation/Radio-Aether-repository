package com.aether.RadioAether.service;

import com.aether.RadioAether.model.dto.request.FavoriteRequest;
import com.aether.RadioAether.model.dto.response.StationDTO;
import com.aether.RadioAether.model.entity.FavoriteStation;
import com.aether.RadioAether.model.entity.User;
import com.aether.RadioAether.repository.FavoriteRepository;
import com.aether.RadioAether.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;

    public List<StationDTO> getFavorites(String email) {
        return favoriteRepository.findByUserEmail(email).stream()
                .map(f -> StationDTO.builder()
                        .id(f.getStationId())
                        .name(f.getName())
                        .streamUrl(f.getStreamUrl())
                        .logoUrl(f.getLogoUrl())
                        .genre(f.getGenre())
                        .build())
                .collect(Collectors.toList());
    }

    public void addFavorite(String email, FavoriteRequest request) {
        if (favoriteRepository.existsByUserEmailAndStationId(email, request.getStationId())) {
            return;
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        FavoriteStation favorite = FavoriteStation.builder()
                .user(user)
                .stationId(request.getStationId())
                .name(request.getName())
                .streamUrl(request.getStreamUrl())
                .logoUrl(request.getLogoUrl())
                .genre(request.getGenre())
                .build();

        favoriteRepository.save(favorite);
    }

    @Transactional
    public void removeFavorite(String email, String stationId) {
        favoriteRepository.deleteByUserEmailAndStationId(email, stationId);
    }

    public boolean isFavorite(String email, String stationId) {
        return favoriteRepository.existsByUserEmailAndStationId(email, stationId);
    }
}
