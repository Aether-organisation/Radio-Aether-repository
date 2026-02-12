package com.aether.RadioAether.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.aether.RadioAether.model.dto.request.LocationRequest;
import com.aether.RadioAether.model.dto.response.StationDTO;
import com.aether.RadioAether.model.entity.Station;
import com.aether.RadioAether.repository.StationRepository;
import com.aether.RadioAether.service.interfaces.IRadioService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RadioService implements IRadioService {

    private final StationRepository stationRepository;

    private static final int EARTH_RADIUS = 6371;

    public StationDTO findNearestStation(LocationRequest request) {
        List<Station> allStations = stationRepository.findAll();

        if (allStations.isEmpty()) {
            throw new RuntimeException("No hay emisoras en la base de datos");
        }

        Station nearestStation = null;
        double minDistance = Double.MAX_VALUE;

        for (Station station : allStations) {
            double distance = calculateHaversineDistance(
                    request.getLatitude(),
                    request.getLongitude(),
                    station.getLatitud(),
                    station.getLongitud()
            );

            if (distance < minDistance) {
                minDistance = distance;
                nearestStation = station;
            }
        }

        return mapToDTO(nearestStation);
    }

    public double calculateHaversineDistance(double startLat, double startLong, double endLat, double endLong) {
        
        double dLat = Math.toRadians(endLat - startLat);
        double dLong = Math.toRadians(endLong - startLong);

        startLat = Math.toRadians(startLat);
        endLat = Math.toRadians(endLat);

        double a = Math.pow(Math.sin(dLat / 2), 2) +
                   Math.cos(startLat) * Math.cos(endLat) *
                   Math.pow(Math.sin(dLong / 2), 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS * c;
    }

    public StationDTO mapToDTO(Station station) {
        return StationDTO.builder()
                .id(station.getId().toString())
                .name(station.getNombre())
                .streamUrl(station.getStreamUrl())
                .logoUrl(station.getLogoURL())
                .genre(station.getGeneroPrincipal())
                .build();
    }
    
    public StationDTO getMockRadio() {
        return StationDTO.builder()
                .id(UUID.randomUUID().toString())
                .name("Los 40 Principales (España)")
                .streamUrl("https://21633.live.streamtheworld.com/LOS40_SC")
                .logoUrl("https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Los_40.svg/3840px-Los_40.svg.png")
                .genre("Pop / Hits")
                .build();
    }
}

