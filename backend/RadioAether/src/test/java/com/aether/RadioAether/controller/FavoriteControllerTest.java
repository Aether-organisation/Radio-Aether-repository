package com.aether.RadioAether.controller;

import com.aether.RadioAether.model.dto.request.FavoriteRequest;
import com.aether.RadioAether.model.dto.response.StationDTO;
import com.aether.RadioAether.service.FavoriteService;
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
 * Unit tests for {@link FavoriteController}.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@ExtendWith(MockitoExtension.class)
class FavoriteControllerTest {

    @Mock
    private FavoriteService favoriteService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private FavoriteController favoriteController;

    @BeforeEach
    void setUp() {
        when(authentication.getName()).thenReturn("user@example.com");
    }

    @Test
    @DisplayName("getFavorites: returns 200 with the list from service")
    void getFavorites_returns200WithList() {
        StationDTO station = StationDTO.builder().id("s1").name("Radio Test").build();
        when(favoriteService.getFavorites("user@example.com")).thenReturn(List.of(station));

        ResponseEntity<List<StationDTO>> response = favoriteController.getFavorites(authentication);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsExactly(station);
    }

    @Test
    @DisplayName("getFavorites: returns empty list when user has no favorites")
    void getFavorites_returnsEmptyList() {
        when(favoriteService.getFavorites("user@example.com")).thenReturn(List.of());

        ResponseEntity<List<StationDTO>> response = favoriteController.getFavorites(authentication);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEmpty();
    }

    @Test
    @DisplayName("addFavorite: returns 200 and delegates to service")
    void addFavorite_returns200() {
        FavoriteRequest request = new FavoriteRequest();
        request.setStationId("station-1");

        ResponseEntity<Void> response = favoriteController.addFavorite(request, authentication);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(favoriteService).addFavorite("user@example.com", request);
    }

    @Test
    @DisplayName("removeFavorite: returns 200 and delegates to service")
    void removeFavorite_returns200() {
        ResponseEntity<Void> response = favoriteController.removeFavorite("station-1", authentication);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(favoriteService).removeFavorite("user@example.com", "station-1");
    }
}
