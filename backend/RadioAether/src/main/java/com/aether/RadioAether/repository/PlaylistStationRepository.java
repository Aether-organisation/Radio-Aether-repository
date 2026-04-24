package com.aether.RadioAether.repository;

import com.aether.RadioAether.model.entity.PlaylistStation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlaylistStationRepository extends JpaRepository<PlaylistStation, String> {

    boolean existsByPlaylistIdAndStationId(String playlistId, String stationId);

    void deleteByPlaylistIdAndStationId(String playlistId, String stationId);
}
