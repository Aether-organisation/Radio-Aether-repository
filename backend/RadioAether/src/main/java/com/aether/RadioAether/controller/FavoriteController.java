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
 * Endpoints for managing user's favourite radio stations.
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

    @GetMapping
    public ResponseEntity<List<StationDTO>> getFavorites(Authentication authentication) {
        return ResponseEntity.ok(favoriteService.getFavorites(authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<Void> addFavorite(
            @RequestBody FavoriteRequest request,
            Authentication authentication) {
        favoriteService.addFavorite(authentication.getName(), request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{stationId}")
    public ResponseEntity<Void> removeFavorite(
            @PathVariable String stationId,
            Authentication authentication) {
        favoriteService.removeFavorite(authentication.getName(), stationId);
        return ResponseEntity.ok().build();
    }
}
