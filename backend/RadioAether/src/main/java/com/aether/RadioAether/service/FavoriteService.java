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

/**
 * Service layer for managing a user's favourite radio stations.
 *
 * <p>Handles CRUD operations against the {@code FAVORITE_STATIONS} table,
 * ensuring idempotent adds (duplicates are silently ignored) and transactional removes.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;

    /**
     * Returns all favourite stations belonging to the given user.
     *
     * @param email the authenticated user's e-mail address
     * @return a list of {@link StationDTO}s; never {@code null}
     */
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

    /**
     * Persists a new favourite station for the given user.
     * If the station is already in the user's favourites, this method returns
     * without performing any write operation.
     *
     * @param email   the authenticated user's e-mail address
     * @param request DTO with the station metadata to persist
     * @throws RuntimeException if no user with the given e-mail exists
     */
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

    /**
     * Removes a station from the user's favourites list.
     *
     * @param email     the authenticated user's e-mail address
     * @param stationId the external station identifier to remove
     */
    @Transactional
    public void removeFavorite(String email, String stationId) {
        favoriteRepository.deleteByUserEmailAndStationId(email, stationId);
    }

    /**
     * Returns {@code true} if the station is already in the user's favourites.
     *
     * @param email     the authenticated user's e-mail address
     * @param stationId the external station identifier to check
     * @return {@code true} if the station is a favourite; {@code false} otherwise
     */
    public boolean isFavorite(String email, String stationId) {
        return favoriteRepository.existsByUserEmailAndStationId(email, stationId);
    }
}
