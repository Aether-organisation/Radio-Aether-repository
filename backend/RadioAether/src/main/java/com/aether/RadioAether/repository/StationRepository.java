package com.aether.RadioAether.repository;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

import com.aether.RadioAether.model.entity.Station;
/**
 * Spring Data JPA repository for {@link Station} entities.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
public interface StationRepository extends JpaRepository<Station, UUID>{

}
