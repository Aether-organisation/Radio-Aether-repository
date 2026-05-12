package com.aether.RadioAether.controller;

import com.aether.RadioAether.model.dto.request.FavoriteRequest;
import com.aether.RadioAether.model.dto.response.StationDTO;
import com.aether.RadioAether.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for managing a user's favourite radio stations.
 *
 * <p>All endpoints require a valid JWT — the authenticated user's e-mail is
 * extracted automatically from the {@link Authentication} principal.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    /**
     * Returns all stations marked as favourite by the authenticated user.
     *
     * @param authentication the current security context (resolved by Spring Security)
     * @return a {@link ResponseEntity} containing the list of {@link StationDTO}s
     */
    @GetMapping
    public ResponseEntity<List<StationDTO>> getFavorites(Authentication authentication) {
        return ResponseEntity.ok(favoriteService.getFavorites(authentication.getName()));
    }

    /**
     * Adds a radio station to the authenticated user's favourites list.
     * If the station is already saved, the request is silently ignored.
     *
     * @param request        body containing the station metadata to persist
     * @param authentication the current security context
     * @return an empty {@code 200 OK} response
     */
    @PostMapping
    public ResponseEntity<Void> addFavorite(
            @RequestBody FavoriteRequest request,
            Authentication authentication) {
        favoriteService.addFavorite(authentication.getName(), request);
        return ResponseEntity.ok().build();
    }

    /**
     * Removes a radio station from the authenticated user's favourites list.
     *
     * @param stationId      the external identifier of the station to remove
     * @param authentication the current security context
     * @return an empty {@code 200 OK} response
     */
    @DeleteMapping("/{stationId}")
    public ResponseEntity<Void> removeFavorite(
            @PathVariable String stationId,
            Authentication authentication) {
        favoriteService.removeFavorite(authentication.getName(), stationId);
        return ResponseEntity.ok().build();
    }
}
