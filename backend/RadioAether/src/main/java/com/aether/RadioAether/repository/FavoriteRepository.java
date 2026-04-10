package com.aether.RadioAether.repository;

import com.aether.RadioAether.model.entity.FavoriteStation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<FavoriteStation, Long> {

    List<FavoriteStation> findByUserEmail(String email);

    Optional<FavoriteStation> findByUserEmailAndStationId(String email, String stationId);

    boolean existsByUserEmailAndStationId(String email, String stationId);

    void deleteByUserEmailAndStationId(String email, String stationId);
}
