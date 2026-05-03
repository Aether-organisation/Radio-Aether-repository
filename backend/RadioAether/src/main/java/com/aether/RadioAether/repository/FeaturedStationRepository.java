package com.aether.RadioAether.repository;

import com.aether.RadioAether.model.entity.FeaturedStation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;
import java.util.List;

/**
 * Spring Data JPA repository for {@link FeaturedStation} entities.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@Repository
public interface FeaturedStationRepository extends JpaRepository<FeaturedStation, UUID> {

    /**
     * Returns the number of stations that are currently active.
     *
     * @return count of active featured stations
     */
    long countByIsActiveTrue();

    /**
     * Returns all currently active featured stations.
     *
     * @return list of active {@link FeaturedStation}s; never {@code null}
     */
    List<FeaturedStation> findByIsActiveTrue();

    /**
     * Looks up a station by the UUID generated at request time and forwarded to Odoo.
     *
     * @param odooRequestId the Odoo request UUID
     * @return an {@link Optional} containing the station, or empty if not found
     */
    Optional<FeaturedStation> findByOdooRequestId(String odooRequestId);
}
