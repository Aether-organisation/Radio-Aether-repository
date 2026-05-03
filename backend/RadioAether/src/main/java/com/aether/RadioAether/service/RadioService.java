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
import com.aether.RadioAether.model.entity.User;
import com.aether.RadioAether.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import java.util.stream.Collectors;
import java.util.Comparator;

/**
 * Service layer for radio-station discovery.
 *
 * <p>On startup, all Radio Browser stations that carry geographic metadata are
 * fetched and cached in memory ({@link #initCache()}). Subsequent calls to
 * {@link #findNearestStation(LocationRequest)} use this in-memory cache to avoid
 * repeated network calls.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.1.0
 */
@Service
@RequiredArgsConstructor
public class RadioService implements IRadioService {

    private final RadioBrowserClient radioBrowserClient;
    private final UserRepository userRepository;
    private List<StationDTO> cachedStations = new ArrayList<>();

    private static final int EARTH_RADIUS = 6371;

    /**
     * Eagerly loads all geo-tagged stations from the Radio Browser API into the
     * in-memory cache at application startup.
     *
     * <p>If the external API is unreachable the cache remains empty and the
     * fallback station is used as a substitute.
     */
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

    /**
     * Returns the up to 10 stations whose geographic position is closest to the
     * coordinates in {@code request}, using the Haversine formula for distance.
     * Falls back to the hardcoded station if the cache is empty.
     *
     * @param request body containing {@code latitude} and {@code longitude}
     * @return a sorted list of the nearest {@link StationDTO}s (at most 10 entries)
     */
    @Override
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

    /**
     * Calculates the great-circle distance in kilometres between two points on
     * Earth using the Haversine formula.
     *
     * @param startLat  latitude of the origin point (degrees)
     * @param startLong longitude of the origin point (degrees)
     * @param endLat    latitude of the destination point (degrees)
     * @param endLong   longitude of the destination point (degrees)
     * @return distance in kilometres
     */
    @Override
    public double calculateHaversineDistance(final double startLat, final double startLong,
                                              final double endLat, final double endLong) {
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

    /**
     * Maps a raw Radio Browser DTO to the application's internal {@link StationDTO}.
     *
     * @param station the raw Radio Browser station data
     * @return the mapped {@link StationDTO}
     */
    @Override
    public StationDTO mapToDTO(final RadioBrowserStationDTO station) {
        return StationDTO.builder()
                .id(station.getStationuuid())
                .name(station.getName())
                .streamUrl(station.getUrlResolved())
                .logoUrl(station.getFavicon())
                .genre(station.getTags())
                .country(station.getCountry())
                .countryCode(station.getCountryCode())
                .latitude(station.getGeoLat())
                .longitude(station.getGeoLong())
                .build();
    }

    /**
     * Searches the Radio Browser API for stations matching the given query and filter type.
     *
     * @param query the search term (already formatted by the controller)
     * @param type  one of {@code "name"}, {@code "genre"} or {@code "country"}
     * @return a list of matching {@link StationDTO}s; never {@code null}
     */
    public List<StationDTO> searchStations(String query, String type) {
        return radioBrowserClient.searchStations(query, type)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Returns personalised station recommendations for the given user.
     *
     * <p>Stations are filtered by the user's preferred genres (stored in
     * {@code UserPreferences}). If no preferences are set or no matches are found,
     * the first 10 cached stations are returned instead.
     *
     * @param email the authenticated user's e-mail address
     * @return a list of up to 10 recommended {@link StationDTO}s
     */
    public List<StationDTO> findForYou(String email) {
        List<String> preferredGenres = new ArrayList<>();

        User user = userRepository.findByEmail(email).orElse(null);
        if (user != null && user.getPreferences() != null
                && user.getPreferences().getFavoriteGenres() != null) {
            preferredGenres = user.getPreferences().getFavoriteGenres()
                    .stream()
                    .map(String::toLowerCase)
                    .collect(Collectors.toList());
        }

        if (cachedStations.isEmpty()) {
            return List.of(getFallbackStation());
        }

        if (preferredGenres.isEmpty()) {
            return cachedStations.stream().limit(10).collect(Collectors.toList());
        }

        final List<String> genres = preferredGenres;
        List<StationDTO> matched = cachedStations.stream()
                .filter(station -> {
                    if (station.getGenre() == null) return false;
                    String stationGenre = station.getGenre().toLowerCase();
                    return genres.stream().anyMatch(stationGenre::contains);
                })
                .limit(10)
                .collect(Collectors.toList());

        return matched.isEmpty()
                ? cachedStations.stream().limit(10).collect(Collectors.toList())
                : matched;
    }

    /**
     * Returns a hardcoded fallback station used when no real station data is available.
     *
     * @return the fallback {@link StationDTO}
     */
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
