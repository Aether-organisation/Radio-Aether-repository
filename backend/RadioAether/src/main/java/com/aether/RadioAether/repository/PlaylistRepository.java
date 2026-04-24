package com.aether.RadioAether.repository;

import com.aether.RadioAether.model.entity.Playlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, String> {

    List<Playlist> findByUserEmailOrderByCreatedAtDesc(String email);

    boolean existsByIdAndUserEmail(String id, String email);
}
