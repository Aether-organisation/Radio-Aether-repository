package com.aether.RadioAether.repository;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

import com.aether.RadioAether.model.entity.Station;
public interface StationRepository extends JpaRepository<Station, UUID>{

}
