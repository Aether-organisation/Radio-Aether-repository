package com.aether.RadioAether.repository;

import com.aether.RadioAether.model.entity.FeaturedStation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;
import java.util.List;

@Repository
public interface FeaturedStationRepository extends JpaRepository<FeaturedStation, UUID> {
    long countByIsActiveTrue();
    List<FeaturedStation> findByIsActiveTrue();
    Optional<FeaturedStation> findByOdooRequestId(String odooRequestId);
}
