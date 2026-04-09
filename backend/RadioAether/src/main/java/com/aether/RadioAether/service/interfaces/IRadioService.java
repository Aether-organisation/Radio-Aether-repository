package com.aether.RadioAether.service.interfaces;

import com.aether.RadioAether.model.dto.request.LocationRequest;
import com.aether.RadioAether.model.dto.response.StationDTO;
import com.aether.RadioAether.model.dto.RadioBrowserStationDTO;
import java.util.List;
public interface IRadioService {

    /**
     * It receives coordinates from the user and returns the nearest station.
     * @param request coordinates from the user
     * @return nearest station
     */
    public List<StationDTO> findNearestStation(LocationRequest request);

    /**
     * Haversine formula
     * Calculate the distance in km between two points on a sphere (The Earth).
     * @param startLat Initial latitude
     * @param startLong Initial length
     * @param endLat final latitude
     * @param endLong final length
     * @return distance in km
     */
    public double calculateHaversineDistance(double startLat, double startLong, double endLat, double endLong);

    /**
     * Method that converts a station into a DTO
     * @param station station
     * @return StationDTO
     */
    public StationDTO mapToDTO(RadioBrowserStationDTO station);
}
