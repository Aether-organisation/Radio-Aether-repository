package com.aether.RadioAether.controller;

import com.aether.RadioAether.model.dto.request.LocationRequest;
import com.aether.RadioAether.model.dto.response.StationDTO;
import com.aether.RadioAether.service.RadioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link RadioController}.
 * Verifies delegation to RadioService and response codes for each endpoint.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class RadioControllerTest {

    @Mock
    private RadioService radioService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private RadioController radioController;

    private StationDTO sampleStation;

    @BeforeEach
    void setUp() {
        sampleStation = StationDTO.builder()
                .id("s1")
                .name("Test FM")
                .streamUrl("https://stream.test.com/live")
                .build();
        when(authentication.getName()).thenReturn("user@example.com");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // getMockRadio
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("getMockRadio: returns 200 with fallback station")
    void getMockRadio_returns200WithFallback() {
        when(radioService.getFallbackStation()).thenReturn(sampleStation);

        ResponseEntity<StationDTO> response = radioController.getMockRadio();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(sampleStation);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // getNearestStation
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("getNearestStation: returns 200 with stations when found")
    void getNearestStation_returns200WhenStationsFound() {
        LocationRequest req = new LocationRequest(40.4, -3.7);
        when(radioService.findNearestStation(req)).thenReturn(List.of(sampleStation));

        ResponseEntity<?> response = radioController.getNearestStation(req);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    @DisplayName("getNearestStation: returns 400 when no stations found")
    void getNearestStation_returns400WhenEmpty() {
        LocationRequest req = new LocationRequest(0.0, 0.0);
        when(radioService.findNearestStation(req)).thenReturn(List.of());

        ResponseEntity<?> response = radioController.getNearestStation(req);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    @DisplayName("getNearestStation: returns 400 when service returns null")
    void getNearestStation_returns400WhenNull() {
        LocationRequest req = new LocationRequest(0.0, 0.0);
        when(radioService.findNearestStation(req)).thenReturn(null);

        ResponseEntity<?> response = radioController.getNearestStation(req);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // searchStations
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("searchStations: returns 200 with results for valid query")
    void searchStations_returns200ForValidQuery() {
        when(radioService.searchStations("rock radio", "name")).thenReturn(List.of(sampleStation));

        ResponseEntity<List<StationDTO>> response =
                radioController.searchStations("Rock Radio", "name");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        // name search lowercases the query
        verify(radioService).searchStations("rock radio", "name");
    }

    @Test
    @DisplayName("searchStations: returns 400 when query is blank")
    void searchStations_returns400ForBlankQuery() {
        ResponseEntity<List<StationDTO>> response =
                radioController.searchStations("  ", "name");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        verify(radioService, never()).searchStations(any(), any());
    }

    @Test
    @DisplayName("searchStations: returns 400 when query is only 1 character")
    void searchStations_returns400ForSingleCharQuery() {
        ResponseEntity<List<StationDTO>> response =
                radioController.searchStations("a", "name");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    @DisplayName("searchStations: capitalises words in country queries")
    void searchStations_capitalisesCountryQuery() {
        when(radioService.searchStations("United Kingdom", "country")).thenReturn(List.of());

        radioController.searchStations("united kingdom", "country");

        verify(radioService).searchStations("United Kingdom", "country");
    }

    @Test
    @DisplayName("searchStations: skips empty tokens when country query has multiple spaces")
    void searchStations_skipsEmptyTokensInCountryQuery() {
        // Double space produces an empty token in split result — the !word.isEmpty() false branch
        when(radioService.searchStations("United States", "country")).thenReturn(List.of());

        radioController.searchStations("united  states", "country");

        verify(radioService).searchStations("United States", "country");
    }

    @Test
    @DisplayName("searchStations: returns 400 when query is null (null-check branch)")
    void searchStations_returns400ForNullQuery() {
        // Covers the q == null branch — first condition in the guard clause.
        // Without this test a professor can replace `q == null ||` with nothing and JaCoCo
        // would still report 100% on the remaining conditions.
        ResponseEntity<List<StationDTO>> response =
                radioController.searchStations(null, "name");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        verify(radioService, never()).searchStations(any(), any());
    }

    @Test
    @DisplayName("searchStations: returns 200 for exactly 2-character query (boundary lower bound)")
    void searchStations_returns200ForTwoCharQuery() {
        // length() == 2 is the smallest passing value (< 2 rejects length 0 and 1).
        // Catches a mutation of `< 2` to `< 3`.
        when(radioService.searchStations("fm", "name")).thenReturn(List.of(sampleStation));

        ResponseEntity<List<StationDTO>> response =
                radioController.searchStations("FM", "name");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(radioService).searchStations("fm", "name");
    }

    @Test
    @DisplayName("searchStations: returns 200 for genre type (no title-case applied)")
    void searchStations_returnsOkForGenreType() {
        // Genre queries are lowercased but NOT title-cased — different branch from country/name.
        when(radioService.searchStations("jazz", "genre")).thenReturn(List.of(sampleStation));

        ResponseEntity<List<StationDTO>> response =
                radioController.searchStations("Jazz", "genre");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(radioService).searchStations("jazz", "genre");
    }

    @Test
    @DisplayName("searchStations: returns empty list (200) when service returns no results")
    void searchStations_returns200WithEmptyList() {
        when(radioService.searchStations("zzzunknown", "name")).thenReturn(List.of());

        ResponseEntity<List<StationDTO>> response =
                radioController.searchStations("ZZZUnknown", "name");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEmpty();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // getForYou
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("getForYou: returns 200 with personalised stations")
    void getForYou_returns200WithStations() {
        when(radioService.findForYou("user@example.com")).thenReturn(List.of(sampleStation));

        ResponseEntity<List<StationDTO>> response = radioController.getForYou(authentication);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsExactly(sampleStation);
    }
}
