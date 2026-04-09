package com.aether.RadioAether.service;

import com.aether.RadioAether.model.dto.RadioBrowserStationDTO;
import com.aether.RadioAether.model.dto.StationDTO;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RadioBrowserClient {

    private final RestClient restClient;

    public RadioBrowserClient() {
        this.restClient = RestClient.builder()
                .baseUrl("http://all.api.radio-browser.info")
                .defaultHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36")
                .build();
    }

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
                            if (station.getUrlResolved() == null) {
                                return false;
                            }
                            if (station.getUrlResolved().isEmpty()) {
                                return false;
                            }
                            String url = station.getUrlResolved().toLowerCase();
                            if (url.contains(".mp3")) {
                                return true;
                            }
                            if (url.contains(".aac")) {
                                return true;
                            }
                            if (url.contains(":8000")) {
                                return true;
                            }
                            if (url.contains(".m3u8")) {
                                return true;
                            }
                            return false;
                        })
                        .map(station -> {
                            return StationDTO.builder()
                                    .id(station.getStationuuid())
                                    .name(station.getName())
                                    .streamUrl(station.getUrlResolved())
                                    .codec(station.getCodec())
                                    .tags(station.getTags())
                                    .favicon(station.getFavicon())
                                    .build();
                        })
                        .collect(Collectors.toList());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }

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
                            if (station.getUrlResolved() == null) {
                                return false;
                            }
                            if (station.getUrlResolved().isEmpty()) {
                                return false;
                            }
                            if (station.getGeoLat() == null) {
                                return false;
                            }
                            if (station.getGeoLong() == null) {
                                return false;
                            }
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

}
