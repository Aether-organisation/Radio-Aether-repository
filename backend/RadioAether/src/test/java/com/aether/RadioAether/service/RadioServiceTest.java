package com.aether.RadioAether.service;

import com.aether.RadioAether.model.dto.RadioBrowserStationDTO;
import com.aether.RadioAether.model.dto.request.LocationRequest;
import com.aether.RadioAether.model.dto.response.StationDTO;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import com.aether.RadioAether.model.entity.User;
import com.aether.RadioAether.model.entity.UserPreferences;
import com.aether.RadioAether.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link RadioService}.
 * Covers the Haversine distance calculation, nearest station search,
 * personalized recommendations (findForYou), and the fallback station mechanism.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class RadioServiceTest {

    @Mock
    private RadioBrowserClient radioBrowserClient;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private RadioService radioService;

    private static final String EMAIL = "user@radio.com";

    // ─────────────────────────────────────────────────────────────────────────
    // initCache
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("initCache: loads stations from RadioBrowserClient into the in-memory cache")
    void initCache_loadsStations() {
        RadioBrowserStationDTO raw = new RadioBrowserStationDTO();
        raw.setStationuuid("init-1");
        raw.setName("Init Station");
        raw.setUrlResolved("https://stream.init.com/live.mp3");
        raw.setGeoLat(40.4168);
        raw.setGeoLong(-3.7038);

        when(radioBrowserClient.getStationsWithGeo()).thenReturn(List.of(raw));

        radioService.initCache();

        LocationRequest request = new LocationRequest();
        request.setLatitude(40.4168);
        request.setLongitude(-3.7038);
        List<StationDTO> result = radioService.findNearestStation(request);
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo("init-1");
    }

    @Test
    @DisplayName("initCache: handles null response from RadioBrowserClient without error")
    void initCache_handlesNullResponse() {
        when(radioBrowserClient.getStationsWithGeo()).thenReturn(null);

        assertThatCode(() -> radioService.initCache()).doesNotThrowAnyException();
    }

    @Test
    @DisplayName("initCache: catches and swallows exceptions when RadioBrowserClient throws")
    void initCache_catchesExceptions() {
        when(radioBrowserClient.getStationsWithGeo())
                .thenThrow(new RuntimeException("Network error"));

        assertThatCode(() -> radioService.initCache()).doesNotThrowAnyException();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // calculateHaversineDistance
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("calculateHaversineDistance: returns 0 for identical coordinates")
    void haversine_returnsZeroForSamePoint() {
        double distance = radioService.calculateHaversineDistance(40.4168, -3.7038, 40.4168, -3.7038);
        assertThat(distance).isEqualTo(0.0);
    }

    @Test
    @DisplayName("calculateHaversineDistance: Madrid to Barcelona is approximately 505 km")
    void haversine_madridToBarcelona() {
        // Madrid: 40.4168, -3.7038  |  Barcelona: 41.3851, 2.1734
        double distance = radioService.calculateHaversineDistance(40.4168, -3.7038, 41.3851, 2.1734);
        assertThat(distance).isBetween(490.0, 520.0);
    }

    @Test
    @DisplayName("calculateHaversineDistance: returns symmetric result (A→B == B→A)")
    void haversine_isSymmetric() {
        double ab = radioService.calculateHaversineDistance(40.4168, -3.7038, 41.3851, 2.1734);
        double ba = radioService.calculateHaversineDistance(41.3851, 2.1734, 40.4168, -3.7038);
        assertThat(ab).isCloseTo(ba, within(0.001));
    }

    @Test
    @DisplayName("calculateHaversineDistance: London to Paris is approximately 340 km")
    void haversine_londonToParis() {
        double distance = radioService.calculateHaversineDistance(51.5074, -0.1278, 48.8566, 2.3522);
        assertThat(distance).isBetween(330.0, 350.0);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // mapToDTO
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("mapToDTO: maps all RadioBrowserStationDTO fields correctly")
    void mapToDTO_mapsAllFields() {
        RadioBrowserStationDTO raw = new RadioBrowserStationDTO();
        raw.setStationuuid("uuid-1");
        raw.setName("Radio Test");
        raw.setUrlResolved("https://stream.test.com");
        raw.setFavicon("https://logo.test.com/img.png");
        raw.setTags("pop,hits");
        raw.setCountry("Spain");
        raw.setCountryCode("ES");
        raw.setGeoLat(40.4168);
        raw.setGeoLong(-3.7038);

        StationDTO dto = radioService.mapToDTO(raw);

        assertThat(dto.getId()).isEqualTo("uuid-1");
        assertThat(dto.getName()).isEqualTo("Radio Test");
        assertThat(dto.getStreamUrl()).isEqualTo("https://stream.test.com");
        assertThat(dto.getLogoUrl()).isEqualTo("https://logo.test.com/img.png");
        assertThat(dto.getGenre()).isEqualTo("pop,hits");
        assertThat(dto.getCountry()).isEqualTo("Spain");
        assertThat(dto.getCountryCode()).isEqualTo("ES");
        assertThat(dto.getLatitude()).isEqualTo(40.4168);
        assertThat(dto.getLongitude()).isEqualTo(-3.7038);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // findNearestStation
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("findNearestStation: returns fallback station when cache is empty")
    void findNearestStation_returnsFallbackWhenCacheEmpty() {
        LocationRequest request = new LocationRequest();
        request.setLatitude(40.4168);
        request.setLongitude(-3.7038);

        List<StationDTO> result = radioService.findNearestStation(request);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).contains("Los 40 Principales");
    }

    @Test
    @DisplayName("findNearestStation: returns up to 10 stations sorted by proximity")
    void findNearestStation_returnsSortedByDistance() throws Exception {
        List<StationDTO> fakeCache = buildFakeStationsAroundMadrid(15);
        injectCachedStations(fakeCache);

        LocationRequest request = new LocationRequest();
        request.setLatitude(40.4168);  // Madrid
        request.setLongitude(-3.7038);

        List<StationDTO> result = radioService.findNearestStation(request);

        assertThat(result).hasSize(10);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // findForYou
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("findForYou: returns fallback when cache is empty")
    void findForYou_returnsFallbackWhenCacheEmpty() {
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.empty());

        List<StationDTO> result = radioService.findForYou(EMAIL);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).contains("Los 40 Principales");
    }

    @Test
    @DisplayName("findForYou: returns up to 10 stations from cache when user has no preferences")
    void findForYou_returnsFirstTenWhenNoPreferences() throws Exception {
        List<StationDTO> fakeCache = buildFakeStationsAroundMadrid(20);
        injectCachedStations(fakeCache);

        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.empty());

        List<StationDTO> result = radioService.findForYou(EMAIL);

        assertThat(result).hasSize(10);
    }

    @Test
    @DisplayName("findForYou: filters by user preferred genres")
    void findForYou_filtersByGenre() throws Exception {
        List<StationDTO> fakeCache = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            fakeCache.add(StationDTO.builder()
                    .id("pop-" + i).name("Pop Station " + i)
                    .streamUrl("https://stream.pop.com/" + i)
                    .genre("pop,hits").build());
        }
        for (int i = 0; i < 5; i++) {
            fakeCache.add(StationDTO.builder()
                    .id("rock-" + i).name("Rock Station " + i)
                    .streamUrl("https://stream.rock.com/" + i)
                    .genre("rock,metal").build());
        }
        injectCachedStations(fakeCache);

        UserPreferences prefs = new UserPreferences();
        prefs.setFavoriteGenres(List.of("pop"));

        User user = User.builder().email(EMAIL).preferences(prefs).activo(true).build();
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));

        List<StationDTO> result = radioService.findForYou(EMAIL);

        assertThat(result).allMatch(s -> s.getGenre().toLowerCase().contains("pop"));
        assertThat(result).noneMatch(s -> s.getGenre().toLowerCase().contains("rock"));
    }

    @Test
    @DisplayName("findForYou: falls back to first 10 when no stations match preferred genres")
    void findForYou_fallsBackToFirstTenWhenNoGenreMatch() throws Exception {
        List<StationDTO> fakeCache = buildFakeStationsAroundMadrid(15);
        injectCachedStations(fakeCache);

        UserPreferences prefs = new UserPreferences();
        prefs.setFavoriteGenres(List.of("classical"));

        User user = User.builder().email(EMAIL).preferences(prefs).activo(true).build();
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));

        List<StationDTO> result = radioService.findForYou(EMAIL);

        assertThat(result).hasSize(10);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // searchStations
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("findForYou: returns first 10 stations when user exists but preferences is null")
    void findForYou_returnsFirstTenWhenPreferencesNull() throws Exception {
        List<StationDTO> fakeCache = buildFakeStationsAroundMadrid(15);
        injectCachedStations(fakeCache);

        User user = User.builder().email(EMAIL).preferences(null).activo(true).build();
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));

        List<StationDTO> result = radioService.findForYou(EMAIL);

        assertThat(result).hasSize(10);
    }

    @Test
    @DisplayName("findForYou: returns first 10 stations when user has preferences but null favoriteGenres")
    void findForYou_returnsFirstTenWhenFavoriteGenresNull() throws Exception {
        List<StationDTO> fakeCache = buildFakeStationsAroundMadrid(15);
        injectCachedStations(fakeCache);

        UserPreferences prefs = new UserPreferences();
        prefs.setFavoriteGenres(null);
        User user = User.builder().email(EMAIL).preferences(prefs).activo(true).build();
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));

        List<StationDTO> result = radioService.findForYou(EMAIL);

        assertThat(result).hasSize(10);
    }

    @Test
    @DisplayName("findForYou: station with null genre is excluded from genre-filtered results")
    void findForYou_stationWithNullGenreIsExcluded() throws Exception {
        List<StationDTO> fakeCache = new ArrayList<>();
        // Stations with null genre — should be filtered out
        for (int i = 0; i < 5; i++) {
            fakeCache.add(StationDTO.builder()
                    .id("null-genre-" + i)
                    .name("Null Genre Station " + i)
                    .streamUrl("https://stream.null.com/" + i)
                    .genre(null)
                    .build());
        }
        // Stations with matching genre
        for (int i = 0; i < 3; i++) {
            fakeCache.add(StationDTO.builder()
                    .id("jazz-" + i)
                    .name("Jazz Station " + i)
                    .streamUrl("https://stream.jazz.com/" + i)
                    .genre("jazz")
                    .build());
        }
        injectCachedStations(fakeCache);

        UserPreferences prefs = new UserPreferences();
        prefs.setFavoriteGenres(List.of("jazz"));
        User user = User.builder().email(EMAIL).preferences(prefs).activo(true).build();
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));

        List<StationDTO> result = radioService.findForYou(EMAIL);

        assertThat(result).hasSize(3);
        assertThat(result).allMatch(s -> "jazz".equals(s.getGenre()));
    }

    @Test
    @DisplayName("searchStations: delegates to RadioBrowserClient and maps results")
    void searchStations_delegatesAndMaps() {
        RadioBrowserStationDTO raw = new RadioBrowserStationDTO();
        raw.setStationuuid("uuid-search");
        raw.setName("Search Result FM");
        raw.setUrlResolved("https://stream.search.com");

        when(radioBrowserClient.searchStations("jazz", "genre"))
                .thenReturn(List.of(raw));

        List<StationDTO> result = radioService.searchStations("jazz", "genre");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Search Result FM");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Injects a pre-built list into the RadioService's cachedStations field via reflection.
     * This avoids the @PostConstruct HTTP call during tests.
     */
    private void injectCachedStations(List<StationDTO> stations) throws Exception {
        Field field = RadioService.class.getDeclaredField("cachedStations");
        field.setAccessible(true);
        field.set(radioService, stations);
    }

    /** Builds n StationDTOs with coordinates slightly offset from Madrid. */
    private List<StationDTO> buildFakeStationsAroundMadrid(int count) {
        List<StationDTO> list = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            list.add(StationDTO.builder()
                    .id("fake-" + i)
                    .name("Station " + i)
                    .streamUrl("https://fake.stream.com/" + i)
                    .genre("pop")
                    .latitude(40.4168 + (i * 0.1))
                    .longitude(-3.7038 + (i * 0.1))
                    .build());
        }
        return list;
    }
}
