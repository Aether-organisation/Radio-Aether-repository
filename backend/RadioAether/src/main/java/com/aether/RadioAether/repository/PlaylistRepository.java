package com.aether.RadioAether.repository;

import com.aether.RadioAether.model.entity.Playlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for {@link Playlist} entities.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, String> {

    /**
     * Returns all playlists owned by the given user, ordered by creation date descending.
     *
     * @param email the user's e-mail address
     * @return an ordered list of {@link Playlist}s; never {@code null}
     */
    List<Playlist> findByUserEmailOrderByCreatedAtDesc(String email);

    /**
     * Returns {@code true} if a playlist with the given ID exists and belongs to the user.
     *
     * @param id    the playlist UUID
     * @param email the user's e-mail address
     * @return {@code true} if ownership is confirmed; {@code false} otherwise
     */
    boolean existsByIdAndUserEmail(String id, String email);
}
