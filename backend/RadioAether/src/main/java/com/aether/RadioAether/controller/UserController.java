package com.aether.RadioAether.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aether.RadioAether.model.dto.request.ChangePasswordRequest;
import com.aether.RadioAether.model.dto.request.UpdateProfilePictureRequest;
import com.aether.RadioAether.model.dto.response.UserProfileResponse;
import com.aether.RadioAether.service.UserService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import com.aether.RadioAether.model.dto.request.SurveyCompletedRequest;

/**
 * REST controller for user profile management.
 *
 * <p>Provides endpoints to retrieve and update the authenticated user's profile data,
 * change their password, update their avatar and record onboarding survey results.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * Returns the public profile of the authenticated user.
     *
     * @param authentication the current security context (resolved by Spring Security)
     * @return a {@link ResponseEntity} containing the {@link UserProfileResponse}
     */
    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(userService.getUserProfile(email));
    }

    /**
     * Changes the authenticated user's password after validating the current one.
     *
     * @param request        body containing the current and new passwords
     * @param authentication the current security context
     * @return a {@link ResponseEntity} with a success message string,
     *         or {@code 400} if the current password does not match
     */
    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(
            @RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        userService.changePassword(email, request);
        return ResponseEntity.ok("Password changed successfully");
    }

    /**
     * Updates the authenticated user's profile picture.
     *
     * @param request        body containing the new Base-64 encoded image string
     * @param authentication the current security context
     * @return a {@link ResponseEntity} with a success message string
     */
    @PutMapping("/profile-picture")
    public ResponseEntity<String> updateProfilePicture(
            @RequestBody UpdateProfilePictureRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        userService.updateProfilePicture(email, request);
        return ResponseEntity.ok("Profile picture updated successfully");
    }

    /**
     * Marks the onboarding survey as completed for the authenticated user and
     * persists the selected favourite genres and gender.
     *
     * @param request        optional body with {@code favoriteGenres} and {@code gender};
     *                       may be {@code null} if the user skipped the survey
     * @param authentication the current security context
     * @return a {@link ResponseEntity} with a success message string
     */
    @PutMapping("/survey-completed")
    public ResponseEntity<String> completeSurvey(
            @RequestBody(required = false) SurveyCompletedRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        List<String> genres = request != null ? request.getFavoriteGenres() : null;
        String gender = request != null ? request.getGender() : null;
        userService.completeSurvey(email, genres, gender);
        return ResponseEntity.ok("Survey completed successfully");
    }
}
