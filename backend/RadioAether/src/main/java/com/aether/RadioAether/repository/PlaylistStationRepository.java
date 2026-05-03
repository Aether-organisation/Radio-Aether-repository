package com.aether.RadioAether.repository;

import com.aether.RadioAether.model.entity.PlaylistStation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for {@link PlaylistStation} junction entities.
 *
 * <p>Each {@code PlaylistStation} record links a playlist to one radio station.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@Repository
public interface PlaylistStationRepository extends JpaRepository<PlaylistStation, String> {

    /**
     * Returns {@code true} if the given station is already present in the given playlist.
     *
     * @param playlistId the UUID of the playlist
     * @param stationId  the external identifier of the station
     * @return {@code true} if the link exists; {@code false} otherwise
     */
    boolean existsByPlaylistIdAndStationId(String playlistId, String stationId);

    /**
     * Removes the link between a playlist and a station.
     *
     * @param playlistId the UUID of the playlist
     * @param stationId  the external identifier of the station to remove
     */
    void deleteByPlaylistIdAndStationId(String playlistId, String stationId);
}
