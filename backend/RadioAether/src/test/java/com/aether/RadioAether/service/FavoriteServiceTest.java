package com.aether.RadioAether.service;

import com.aether.RadioAether.model.dto.request.FavoriteRequest;
import com.aether.RadioAether.model.dto.response.StationDTO;
import com.aether.RadioAether.model.entity.FavoriteStation;
import com.aether.RadioAether.model.entity.User;
import com.aether.RadioAether.repository.FavoriteRepository;
import com.aether.RadioAether.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link FavoriteService}.
 * Covers retrieval, addition (with duplicate guard), removal, and existence check
 * of favorite radio stations per user.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@ExtendWith(MockitoExtension.class)
class FavoriteServiceTest {

    @Mock
    private FavoriteRepository favoriteRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private FavoriteService favoriteService;

    private static final String EMAIL = "test@radio.com";

    private User mockUser;
    private FavoriteRequest favoriteRequest;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .idUsuario(1L)
                .nombre("TestUser")
                .email(EMAIL)
                .activo(true)
                .build();

        favoriteRequest = new FavoriteRequest();
        favoriteRequest.setStationId("station-abc");
        favoriteRequest.setName("Radio Test FM");
        favoriteRequest.setStreamUrl("https://stream.test.com");
        favoriteRequest.setLogoUrl("https://logo.test.com/img.png");
        favoriteRequest.setGenre("Pop");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // getFavorites
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("getFavorites: returns list of StationDTOs for the user")
    void getFavorites_returnsStationDTOs() {
        FavoriteStation fav = FavoriteStation.builder()
                .stationId("station-abc")
                .name("Radio Test FM")
                .streamUrl("https://stream.test.com")
                .logoUrl("https://logo.test.com/img.png")
                .genre("Pop")
                .user(mockUser)
                .build();

        when(favoriteRepository.findByUserEmail(EMAIL)).thenReturn(List.of(fav));

        List<StationDTO> result = favoriteService.getFavorites(EMAIL);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo("station-abc");
        assertThat(result.get(0).getName()).isEqualTo("Radio Test FM");
        assertThat(result.get(0).getGenre()).isEqualTo("Pop");
    }

    @Test
    @DisplayName("getFavorites: returns empty list when user has no favorites")
    void getFavorites_returnsEmptyList() {
        when(favoriteRepository.findByUserEmail(EMAIL)).thenReturn(List.of());

        List<StationDTO> result = favoriteService.getFavorites(EMAIL);

        assertThat(result).isEmpty();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // addFavorite
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("addFavorite: saves new favorite when it does not already exist")
    void addFavorite_savesNewFavorite() {
        when(favoriteRepository.existsByUserEmailAndStationId(EMAIL, "station-abc"))
                .thenReturn(false);
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(mockUser));

        favoriteService.addFavorite(EMAIL, favoriteRequest);

        ArgumentCaptor<FavoriteStation> captor = ArgumentCaptor.forClass(FavoriteStation.class);
        verify(favoriteRepository).save(captor.capture());

        FavoriteStation saved = captor.getValue();
        assertThat(saved.getStationId()).isEqualTo("station-abc");
        assertThat(saved.getName()).isEqualTo("Radio Test FM");
        assertThat(saved.getUser()).isEqualTo(mockUser);
    }

    @Test
    @DisplayName("addFavorite: skips save when favorite already exists (idempotent)")
    void addFavorite_doesNothingIfAlreadyFavorited() {
        when(favoriteRepository.existsByUserEmailAndStationId(EMAIL, "station-abc"))
                .thenReturn(true);

        favoriteService.addFavorite(EMAIL, favoriteRequest);

        verify(favoriteRepository, never()).save(any());
        verify(userRepository, never()).findByEmail(any());
    }

    @Test
    @DisplayName("addFavorite: throws RuntimeException when user not found")
    void addFavorite_throwsWhenUserNotFound() {
        when(favoriteRepository.existsByUserEmailAndStationId(EMAIL, "station-abc"))
                .thenReturn(false);
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> favoriteService.addFavorite(EMAIL, favoriteRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("User not found");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // removeFavorite
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("removeFavorite: delegates deletion to repository")
    void removeFavorite_callsRepository() {
        favoriteService.removeFavorite(EMAIL, "station-abc");

        verify(favoriteRepository).deleteByUserEmailAndStationId(EMAIL, "station-abc");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // isFavorite
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("isFavorite: returns true when station is in favorites")
    void isFavorite_returnsTrueWhenPresent() {
        when(favoriteRepository.existsByUserEmailAndStationId(EMAIL, "station-abc"))
                .thenReturn(true);

        assertThat(favoriteService.isFavorite(EMAIL, "station-abc")).isTrue();
    }

    @Test
    @DisplayName("isFavorite: returns false when station is not in favorites")
    void isFavorite_returnsFalseWhenAbsent() {
        when(favoriteRepository.existsByUserEmailAndStationId(EMAIL, "station-xyz"))
                .thenReturn(false);

        assertThat(favoriteService.isFavorite(EMAIL, "station-xyz")).isFalse();
    }
}
