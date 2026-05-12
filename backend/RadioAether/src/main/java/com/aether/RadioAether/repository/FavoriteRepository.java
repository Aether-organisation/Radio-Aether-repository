package com.aether.RadioAether.repository;

import com.aether.RadioAether.model.entity.FavoriteStation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for {@link FavoriteStation} entities.
 *
 * <p>Supports lookup, existence checks and transactional deletion scoped to a
 * specific user-email / station-id pair.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@Repository
public interface FavoriteRepository extends JpaRepository<FavoriteStation, Long> {

    /**
     * Returns all favourite stations belonging to the given user.
     *
     * @param email the user's e-mail address
     * @return a list of {@link FavoriteStation}s; never {@code null}
     */
    List<FavoriteStation> findByUserEmail(String email);

    /**
     * Returns the favourite station entry that matches the given e-mail and station ID.
     *
     * @param email     the user's e-mail address
     * @param stationId the external station identifier
     * @return an {@link Optional} containing the match, or empty
     */
    Optional<FavoriteStation> findByUserEmailAndStationId(String email, String stationId);

    /**
     * Returns {@code true} if the station is already in the user's favourites.
     *
     * @param email     the user's e-mail address
     * @param stationId the external station identifier
     * @return {@code true} if an entry exists; {@code false} otherwise
     */
    boolean existsByUserEmailAndStationId(String email, String stationId);

    /**
     * Deletes the favourite entry matching the given user e-mail and station ID.
     *
     * @param email     the user's e-mail address
     * @param stationId the external station identifier to remove
     */
    void deleteByUserEmailAndStationId(String email, String stationId);
}
