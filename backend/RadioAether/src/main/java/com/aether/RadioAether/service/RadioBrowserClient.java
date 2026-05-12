package com.aether.RadioAether.service;

import com.aether.RadioAether.model.dto.RadioBrowserStationDTO;
import com.aether.RadioAether.model.dto.StationDTO;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * HTTP client for the Radio Browser community API ({@code radio-browser.info}).
 *
 * <p>Provides methods to fetch stations by genre/tag, retrieve geo-tagged stations
 * for the proximity feature, and perform free-text or parameterised searches.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@Service
public class RadioBrowserClient {

    private final RestClient restClient;

    /**
     * Constructs the client and configures the base URL and browser-like User-Agent
     * required by the Radio Browser API.
     */
    public RadioBrowserClient() {
        this.restClient = RestClient.builder()
                .baseUrl("http://all.api.radio-browser.info")
                .defaultHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36")
                .build();
    }

    /**
     * Returns up to 100 MP3/AAC/HLS stations tagged with the given genre.
     *
     * <p>Stations with missing or non-audio stream URLs are filtered out.
     *
     * @param genre the Radio Browser genre/tag to search for
     * @return a list of matching {@link StationDTO}s; empty on error
     */
    public List<StationDTO> getStationsByGenre(final String genre) {
        List<StationDTO> result = new ArrayList<>();
        try {
            List<RadioBrowserStationDTO> externalStations = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/json/stations/search")
                            .queryParam("tag", genre)
                            .queryParam("codec", "mp3")
                            .queryParam("hidebroken", "true")
                            .queryParam("limit", "100")
                            .build())
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<RadioBrowserStationDTO>>() {});

            if (externalStations != null) {
                result = externalStations.stream()
                        .filter(station -> {
                            if (station.getUrlResolved() == null) return false;
                            if (station.getUrlResolved().isEmpty()) return false;
                            String url = station.getUrlResolved().toLowerCase();
                            return url.contains(".mp3") || url.contains(".aac")
                                    || url.contains(":8000") || url.contains(".m3u8");
                        })
                        .map(station -> StationDTO.builder()
                                .id(station.getStationuuid())
                                .name(station.getName())
                                .streamUrl(station.getUrlResolved())
                                .codec(station.getCodec())
                                .tags(station.getTags())
                                .favicon(station.getFavicon())
                                .build())
                        .collect(Collectors.toList());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }

    /**
     * Returns all stations that have geographic metadata (latitude/longitude).
     *
     * <p>Only HTTPS direct-audio streams are included; playlist formats (.m3u8, .pls, etc.)
     * are excluded to ensure mobile compatibility.
     *
     * @return a list of geo-tagged {@link RadioBrowserStationDTO}s; empty on error
     */
    public List<RadioBrowserStationDTO> getStationsWithGeo() {
        try {
            List<RadioBrowserStationDTO> externalStations = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/json/stations/search")
                            .queryParam("has_geo_info", "true")
                            .queryParam("hidebroken", "true")
                            .queryParam("lastcheckok", "1")
                            .queryParam("is_https", "true")
                            .queryParam("order", "clickcount")
                            .build())
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<RadioBrowserStationDTO>>() {});

            if (externalStations != null) {
                return externalStations.stream()
                        .filter(station -> {
                            if (station.getUrlResolved() == null || station.getUrlResolved().isEmpty()) return false;
                            if (station.getGeoLat() == null || station.getGeoLong() == null) return false;
                            String url = station.getUrlResolved().toLowerCase();
                            boolean isDirectAudio = url.contains(".mp3") || url.contains(".aac") || url.contains(":8000");
                            boolean isPlaylist = url.contains(".m3u8") || url.contains(".pls") || url.contains(".m3u") || url.contains(".ashx");
                            return isDirectAudio && !isPlaylist;
                        })
                        .collect(Collectors.toList());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return new ArrayList<>();
    }

    /**
     * Searches Radio Browser stations by name, country or genre tag.
     *
     * @param query the search term
     * @param type  one of {@code "name"}, {@code "country"} or {@code "genre"}
     * @return a list of up to 20 matching {@link RadioBrowserStationDTO}s; empty on error
     */
    public List<RadioBrowserStationDTO> searchStations(String query, String type) {
        String param = switch (type) {
            case "country" -> "country";
            case "genre"   -> "tag";
            default        -> "name";
        };

        try {
            List<RadioBrowserStationDTO> results = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/json/stations/search")
                            .queryParam(param, query)
                            .queryParam("hidebroken", "true")
                            .queryParam("lastcheckok", "1")
                            .queryParam("limit", "20")
                            .queryParam("order", "clickcount")
                            .queryParam("reverse", "true")
                            .build())
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<RadioBrowserStationDTO>>() {});

            if (results == null) return new ArrayList<>();

            return results.stream()
                    .filter(s -> s.getUrlResolved() != null && !s.getUrlResolved().isBlank())
                    .collect(Collectors.toList());
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
}
