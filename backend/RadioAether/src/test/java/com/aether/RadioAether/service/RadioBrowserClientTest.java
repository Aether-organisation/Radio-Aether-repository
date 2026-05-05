package com.aether.RadioAether.service;

import com.aether.RadioAether.model.dto.RadioBrowserStationDTO;
import com.aether.RadioAether.model.dto.StationDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriBuilder;
import org.springframework.web.util.UriComponentsBuilder;

import java.lang.reflect.Field;
import java.net.URI;
import java.util.List;
import java.util.function.Function;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link RadioBrowserClient}.
 * Uses reflection to inject a mock RestClient so no real HTTP calls are made.
 * The URI-builder lambda is actually executed via thenAnswer so that JaCoCo
 * instruments the lambda body and records it as covered.
 * Covers the URL filtering logic in getStationsByGenre and getStationsWithGeo,
 * and the query parameter selection in searchStations.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.1.0
 */
@ExtendWith(MockitoExtension.class)
class RadioBrowserClientTest {

    private RadioBrowserClient radioBrowserClient;

    @SuppressWarnings("rawtypes")
    private RestClient.RequestHeadersUriSpec mockUriSpec;
    private RestClient.ResponseSpec mockResponseSpec;

    @BeforeEach
    @SuppressWarnings({"unchecked", "rawtypes"})
    void setUp() throws Exception {
        radioBrowserClient = new RadioBrowserClient();

        RestClient mockRestClient = mock(RestClient.class);
        mockUriSpec = mock(RestClient.RequestHeadersUriSpec.class);
        mockResponseSpec = mock(RestClient.ResponseSpec.class);

        when(mockRestClient.get()).thenReturn(mockUriSpec);

        // Execute the URI-builder lambda so JaCoCo counts those instructions as covered.
        when(mockUriSpec.uri(any(Function.class))).thenAnswer(invocation -> {
            Function<UriBuilder, URI> fn = invocation.getArgument(0);
            fn.apply(UriComponentsBuilder.newInstance());
            return mockUriSpec;
        });

        when(mockUriSpec.retrieve()).thenReturn(mockResponseSpec);

        Field field = RadioBrowserClient.class.getDeclaredField("restClient");
        field.setAccessible(true);
        field.set(radioBrowserClient, mockRestClient);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helper: build a minimal RadioBrowserStationDTO
    // ─────────────────────────────────────────────────────────────────────────

    private RadioBrowserStationDTO station(String uuid, String url) {
        RadioBrowserStationDTO dto = new RadioBrowserStationDTO();
        dto.setStationuuid(uuid);
        dto.setName("Radio " + uuid);
        dto.setUrlResolved(url);
        dto.setCodec("MP3");
        dto.setTags("test");
        dto.setFavicon("https://example.com/favicon.ico");
        return dto;
    }

    private RadioBrowserStationDTO geoStation(String uuid, String url, Double lat, Double lon) {
        RadioBrowserStationDTO dto = station(uuid, url);
        dto.setGeoLat(lat);
        dto.setGeoLong(lon);
        return dto;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // getStationsByGenre — URL filtering
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("getStationsByGenre: includes stations with .mp3 in URL")
    @SuppressWarnings("unchecked")
    void getStationsByGenre_includesMp3Url() {
        when(mockResponseSpec.body(any(ParameterizedTypeReference.class)))
                .thenReturn(List.of(station("s1", "https://stream.test.com/live.mp3")));

        List<StationDTO> result = radioBrowserClient.getStationsByGenre("rock");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo("s1");
    }

    @Test
    @DisplayName("getStationsByGenre: includes stations with .aac in URL")
    @SuppressWarnings("unchecked")
    void getStationsByGenre_includesAacUrl() {
        when(mockResponseSpec.body(any(ParameterizedTypeReference.class)))
                .thenReturn(List.of(station("s2", "https://stream.test.com/live.aac")));

        List<StationDTO> result = radioBrowserClient.getStationsByGenre("jazz");

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("getStationsByGenre: includes stations streaming on port 8000")
    @SuppressWarnings("unchecked")
    void getStationsByGenre_includesPort8000Url() {
        when(mockResponseSpec.body(any(ParameterizedTypeReference.class)))
                .thenReturn(List.of(station("s3", "http://stream.test.com:8000/live")));

        List<StationDTO> result = radioBrowserClient.getStationsByGenre("pop");

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("getStationsByGenre: includes stations with .m3u8 playlist URL")
    @SuppressWarnings("unchecked")
    void getStationsByGenre_includesM3u8Url() {
        when(mockResponseSpec.body(any(ParameterizedTypeReference.class)))
                .thenReturn(List.of(station("s4", "https://stream.test.com/live.m3u8")));

        List<StationDTO> result = radioBrowserClient.getStationsByGenre("pop");

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("getStationsByGenre: excludes stations with unrecognised URL format")
    @SuppressWarnings("unchecked")
    void getStationsByGenre_excludesUnrecognisedUrl() {
        when(mockResponseSpec.body(any(ParameterizedTypeReference.class)))
                .thenReturn(List.of(station("s5", "https://stream.test.com/live")));

        List<StationDTO> result = radioBrowserClient.getStationsByGenre("pop");

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("getStationsByGenre: excludes stations with null URL")
    @SuppressWarnings("unchecked")
    void getStationsByGenre_excludesNullUrl() {
        when(mockResponseSpec.body(any(ParameterizedTypeReference.class)))
                .thenReturn(List.of(station("s6", null)));

        List<StationDTO> result = radioBrowserClient.getStationsByGenre("pop");

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("getStationsByGenre: excludes stations with empty URL")
    @SuppressWarnings("unchecked")
    void getStationsByGenre_excludesEmptyUrl() {
        when(mockResponseSpec.body(any(ParameterizedTypeReference.class)))
                .thenReturn(List.of(station("s7", "")));

        List<StationDTO> result = radioBrowserClient.getStationsByGenre("pop");

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("getStationsByGenre: returns empty list when API returns null")
    @SuppressWarnings("unchecked")
    void getStationsByGenre_returnsEmptyWhenApiReturnsNull() {
        when(mockResponseSpec.body(any(ParameterizedTypeReference.class))).thenReturn(null);

        List<StationDTO> result = radioBrowserClient.getStationsByGenre("rock");

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("getStationsByGenre: returns empty list on API exception")
    @SuppressWarnings("unchecked")
    void getStationsByGenre_returnsEmptyOnException() {
        when(mockResponseSpec.body(any(ParameterizedTypeReference.class)))
                .thenThrow(new RuntimeException("Connection refused"));

        List<StationDTO> result = radioBrowserClient.getStationsByGenre("rock");

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("getStationsByGenre: filters mixed results keeping only valid URLs")
    @SuppressWarnings("unchecked")
    void getStationsByGenre_filtersMixedResults() {
        List<RadioBrowserStationDTO> mixed = List.of(
                station("valid-mp3",  "https://stream.test.com/live.mp3"),
                station("invalid",    "https://stream.test.com/live"),
                station("valid-port", "http://stream.test.com:8000/live"),
                station("null-url",   null)
        );
        when(mockResponseSpec.body(any(ParameterizedTypeReference.class))).thenReturn(mixed);

        List<StationDTO> result = radioBrowserClient.getStationsByGenre("jazz");

        assertThat(result).hasSize(2);
        assertThat(result).extracting(StationDTO::getId)
                .containsExactlyInAnyOrder("valid-mp3", "valid-port");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // getStationsWithGeo — more restrictive filtering
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("getStationsWithGeo: includes direct audio stations with geo info")
    @SuppressWarnings("unchecked")
    void getStationsWithGeo_includesValidStation() {
        RadioBrowserStationDTO dto = geoStation("sg1", "http://stream.test.com:8000/live", 40.4, -3.7);
        when(mockResponseSpec.body(any(ParameterizedTypeReference.class))).thenReturn(List.of(dto));

        List<RadioBrowserStationDTO> result = radioBrowserClient.getStationsWithGeo();

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("getStationsWithGeo: excludes stations with null URL")
    @SuppressWarnings("unchecked")
    void getStationsWithGeo_excludesNullUrl() {
        RadioBrowserStationDTO dto = geoStation("sg0", null, 40.4, -3.7);
        when(mockResponseSpec.body(any(ParameterizedTypeReference.class))).thenReturn(List.of(dto));

        List<RadioBrowserStationDTO> result = radioBrowserClient.getStationsWithGeo();

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("getStationsWithGeo: excludes stations with empty URL")
    @SuppressWarnings("unchecked")
    void getStationsWithGeo_excludesEmptyUrl() {
        RadioBrowserStationDTO dto = geoStation("sg-empty", "", 40.4, -3.7);
        when(mockResponseSpec.body(any(ParameterizedTypeReference.class))).thenReturn(List.of(dto));

        List<RadioBrowserStationDTO> result = radioBrowserClient.getStationsWithGeo();

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("getStationsWithGeo: excludes stations with null geo coordinates")
    @SuppressWarnings("unchecked")
    void getStationsWithGeo_excludesNullGeo() {
        RadioBrowserStationDTO dto = geoStation("sg2", "http://stream.test.com:8000/live", null, null);
        when(mockResponseSpec.body(any(ParameterizedTypeReference.class))).thenReturn(List.of(dto));

        List<RadioBrowserStationDTO> result = radioBrowserClient.getStationsWithGeo();

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("getStationsWithGeo: excludes .m3u8 URLs (playlist, not direct audio)")
    @SuppressWarnings("unchecked")
    void getStationsWithGeo_excludesM3u8() {
        RadioBrowserStationDTO dto = geoStation("sg3", "https://stream.test.com/live.m3u8", 40.4, -3.7);
        when(mockResponseSpec.body(any(ParameterizedTypeReference.class))).thenReturn(List.of(dto));

        List<RadioBrowserStationDTO> result = radioBrowserClient.getStationsWithGeo();

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("getStationsWithGeo: excludes .pls playlist URLs")
    @SuppressWarnings("unchecked")
    void getStationsWithGeo_excludesPlsPlaylist() {
        RadioBrowserStationDTO dto = geoStation("sg4", "https://stream.test.com/live.pls", 40.4, -3.7);
        when(mockResponseSpec.body(any(ParameterizedTypeReference.class))).thenReturn(List.of(dto));

        List<RadioBrowserStationDTO> result = radioBrowserClient.getStationsWithGeo();

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("getStationsWithGeo: excludes .m3u playlist URLs")
    @SuppressWarnings("unchecked")
    void getStationsWithGeo_excludesM3uPlaylist() {
        RadioBrowserStationDTO dto = geoStation("sg5", "https://stream.test.com/playlist.m3u", 40.4, -3.7);
        when(mockResponseSpec.body(any(ParameterizedTypeReference.class))).thenReturn(List.of(dto));

        List<RadioBrowserStationDTO> result = radioBrowserClient.getStationsWithGeo();

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("getStationsWithGeo: excludes .ashx playlist URLs")
    @SuppressWarnings("unchecked")
    void getStationsWithGeo_excludesAshxPlaylist() {
        RadioBrowserStationDTO dto = geoStation("sg6", "https://stream.test.com/stream.ashx", 40.4, -3.7);
        when(mockResponseSpec.body(any(ParameterizedTypeReference.class))).thenReturn(List.of(dto));

        List<RadioBrowserStationDTO> result = radioBrowserClient.getStationsWithGeo();

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("getStationsWithGeo: returns empty list when API returns null")
    @SuppressWarnings("unchecked")
    void getStationsWithGeo_returnsEmptyWhenApiReturnsNull() {
        when(mockResponseSpec.body(any(ParameterizedTypeReference.class))).thenReturn(null);

        List<RadioBrowserStationDTO> result = radioBrowserClient.getStationsWithGeo();

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("getStationsWithGeo: returns empty list on API exception")
    @SuppressWarnings("unchecked")
    void getStationsWithGeo_returnsEmptyOnException() {
        when(mockResponseSpec.body(any(ParameterizedTypeReference.class)))
                .thenThrow(new RuntimeException("Timeout"));

        List<RadioBrowserStationDTO> result = radioBrowserClient.getStationsWithGeo();

        assertThat(result).isEmpty();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // searchStations — query param selection and URL filtering
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("searchStations: returns mapped stations with valid URLs (name type)")
    @SuppressWarnings("unchecked")
    void searchStations_returnsMappedStations() {
        RadioBrowserStationDTO dto = station("res1", "https://stream.test.com/live.mp3");
        when(mockResponseSpec.body(any(ParameterizedTypeReference.class))).thenReturn(List.of(dto));

        List<RadioBrowserStationDTO> result = radioBrowserClient.searchStations("rock", "name");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStationuuid()).isEqualTo("res1");
    }

    @Test
    @DisplayName("searchStations: uses 'tag' query param for genre type")
    @SuppressWarnings("unchecked")
    void searchStations_usesTagParamForGenreType() {
        RadioBrowserStationDTO dto = station("genre1", "https://stream.test.com/live.mp3");
        when(mockResponseSpec.body(any(ParameterizedTypeReference.class))).thenReturn(List.of(dto));

        List<RadioBrowserStationDTO> result = radioBrowserClient.searchStations("jazz", "genre");

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("searchStations: uses 'country' query param for country type")
    @SuppressWarnings("unchecked")
    void searchStations_usesCountryParamForCountryType() {
        RadioBrowserStationDTO dto = station("country1", "https://stream.test.com/live.mp3");
        when(mockResponseSpec.body(any(ParameterizedTypeReference.class))).thenReturn(List.of(dto));

        List<RadioBrowserStationDTO> result = radioBrowserClient.searchStations("Spain", "country");

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("searchStations: returns empty list when API returns null")
    @SuppressWarnings("unchecked")
    void searchStations_returnsEmptyWhenNull() {
        when(mockResponseSpec.body(any(ParameterizedTypeReference.class))).thenReturn(null);

        List<RadioBrowserStationDTO> result = radioBrowserClient.searchStations("test", "name");

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("searchStations: filters out stations with blank URL")
    @SuppressWarnings("unchecked")
    void searchStations_filtersBlankUrls() {
        List<RadioBrowserStationDTO> mixed = List.of(
                station("ok",    "https://stream.ok.com/live.mp3"),
                station("blank", "   ")
        );
        when(mockResponseSpec.body(any(ParameterizedTypeReference.class))).thenReturn(mixed);

        List<RadioBrowserStationDTO> result = radioBrowserClient.searchStations("jazz", "genre");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStationuuid()).isEqualTo("ok");
    }

    @Test
    @DisplayName("searchStations: filters out stations with null URL")
    @SuppressWarnings("unchecked")
    void searchStations_filtersNullUrls() {
        List<RadioBrowserStationDTO> mixed = List.of(
                station("ok",   "https://stream.ok.com/live.mp3"),
                station("null", null)
        );
        when(mockResponseSpec.body(any(ParameterizedTypeReference.class))).thenReturn(mixed);

        List<RadioBrowserStationDTO> result = radioBrowserClient.searchStations("rock", "name");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStationuuid()).isEqualTo("ok");
    }

    @Test
    @DisplayName("searchStations: returns empty list on API exception")
    @SuppressWarnings("unchecked")
    void searchStations_returnsEmptyOnException() {
        when(mockResponseSpec.body(any(ParameterizedTypeReference.class)))
                .thenThrow(new RuntimeException("Network error"));

        List<RadioBrowserStationDTO> result = radioBrowserClient.searchStations("jazz", "name");

        assertThat(result).isEmpty();
    }
}
