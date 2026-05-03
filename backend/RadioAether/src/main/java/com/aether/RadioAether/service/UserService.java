package com.aether.RadioAether.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.aether.RadioAether.model.dto.request.ChangePasswordRequest;
import com.aether.RadioAether.model.dto.request.UpdateProfilePictureRequest;
import com.aether.RadioAether.model.dto.response.UserProfileResponse;
import com.aether.RadioAether.model.entity.User;
import com.aether.RadioAether.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import com.aether.RadioAether.model.entity.UserPreferences;

/**
 * Service layer for user profile management.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Returns the public profile information for the given user.
     *
     * @param email the user's e-mail address
     * @return the populated {@link UserProfileResponse}
     * @throws RuntimeException if no user with the given e-mail exists
     */
    public UserProfileResponse getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return UserProfileResponse.builder()
                .nombre(user.getNombre())
                .email(user.getEmail())
                .fechaRegistro(user.getFechaRegistro() != null ? user.getFechaRegistro().toString() : null)
                .fotoPerfil(user.getFotoPerfil())
                .build();
    }

    /**
     * Changes the user's password after validating the current one.
     *
     * @param email   the user's e-mail address
     * @param request DTO containing the current and new password
     * @throws RuntimeException if the current password does not match or the user is not found
     */
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Incorrect current password");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    /**
     * Replaces the user's profile picture.
     *
     * @param email   the user's e-mail address
     * @param request DTO containing the new Base-64 encoded image string
     * @throws RuntimeException if no user with the given e-mail exists
     */
    public void updateProfilePicture(String email, UpdateProfilePictureRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setFotoPerfil(request.getFotoPerfil());
        userRepository.save(user);
    }

    /**
     * Marks the onboarding survey as completed and persists the user's preferences.
     *
     * @param email  the user's e-mail address
     * @param genres the favourite genres selected during the survey; may be {@code null}
     * @param gender the user's gender selection; may be {@code null}
     * @throws RuntimeException if no user with the given e-mail exists
     */
    public void completeSurvey(String email, List<String> genres, String gender) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setSurveyCompleted(true);
        if (gender != null) {
            user.setGenero(gender);
        }
        if (genres != null && !genres.isEmpty()) {
            UserPreferences prefs = new UserPreferences();
            prefs.setFavoriteGenres(genres);
            user.setPreferences(prefs);
        }
        userRepository.save(user);
    }
}
