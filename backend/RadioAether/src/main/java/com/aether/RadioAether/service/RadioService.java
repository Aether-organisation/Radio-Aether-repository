package com.aether.RadioAether.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import java.util.ArrayList;

import com.aether.RadioAether.model.dto.request.LocationRequest;
import com.aether.RadioAether.model.dto.response.StationDTO;
import com.aether.RadioAether.service.interfaces.IRadioService;
import com.aether.RadioAether.model.dto.RadioBrowserStationDTO;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Comparator;
@Service
@RequiredArgsConstructor
public class RadioService implements IRadioService {

    private final RadioBrowserClient radioBrowserClient;
    private List<StationDTO> cachedStations = new ArrayList<>();

    private static final int EARTH_RADIUS = 6371;

    @PostConstruct
    public void initCache() {
        try {
            List<RadioBrowserStationDTO> rawStations = radioBrowserClient.getStationsWithGeo();
            if (rawStations != null) {
                cachedStations = rawStations.stream()
                        .map(this::mapToDTO)
                        .collect(Collectors.toList());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public List<StationDTO> findNearestStation(final LocationRequest request) {
        if (!cachedStations.isEmpty()) {
            return cachedStations.stream()
                    .sorted(Comparator.comparingDouble(station -> calculateHaversineDistance(
                            request.getLatitude(),
                            request.getLongitude(),
                            station.getLatitude(),
                            station.getLongitude())))
                    .limit(10)
                    .collect(Collectors.toList());
        }
        return List.of(getFallbackStation());
    }

    public double calculateHaversineDistance(final double startLat, final double startLong, final double endLat, final double endLong) {
        double dLat = Math.toRadians(endLat - startLat);
        double dLong = Math.toRadians(endLong - startLong);

        double radStartLat = Math.toRadians(startLat);
        double radEndLat = Math.toRadians(endLat);

        double a = Math.pow(Math.sin(dLat / 2), 2) +
                   Math.cos(radStartLat) * Math.cos(radEndLat) *
                   Math.pow(Math.sin(dLong / 2), 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS * c;
    }

    public StationDTO mapToDTO(final RadioBrowserStationDTO station) {
        return StationDTO.builder()
                .id(station.getStationuuid())
                .name(station.getName())
                .streamUrl(station.getUrlResolved())
                .logoUrl(station.getFavicon())
                .genre(station.getTags())
                .latitude(station.getGeoLat())
                .longitude(station.getGeoLong())
                .build();
    }
    
    public StationDTO getFallbackStation() {
        return StationDTO.builder()
                .id(UUID.randomUUID().toString())
                .name("Los 40 Principales (España)")
                .streamUrl("https://21633.live.streamtheworld.com/LOS40_SC")
                .logoUrl("https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Los_40.svg/3840px-Los_40.svg.png")
                .genre("Pop / Hits")
                .build();
    }
}

