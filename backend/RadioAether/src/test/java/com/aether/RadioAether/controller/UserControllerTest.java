package com.aether.RadioAether.controller;

import com.aether.RadioAether.model.dto.request.ChangePasswordRequest;
import com.aether.RadioAether.model.dto.request.SurveyCompletedRequest;
import com.aether.RadioAether.model.dto.request.UpdateProfilePictureRequest;
import com.aether.RadioAether.model.dto.response.UserProfileResponse;
import com.aether.RadioAether.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link UserController}.
 * Verifies that controller methods delegate correctly to {@link UserService}
 * and return appropriate HTTP responses.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserService userService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private UserController userController;

    @BeforeEach
    void setUp() {
        when(authentication.getName()).thenReturn("user@example.com");
    }

    @Test
    @DisplayName("getProfile: returns 200 with the profile from the service")
    void getProfile_returns200WithProfile() {
        UserProfileResponse profile = UserProfileResponse.builder()
                .nombre("Test User")
                .email("user@example.com")
                .build();
        when(userService.getUserProfile("user@example.com")).thenReturn(profile);

        ResponseEntity<UserProfileResponse> response = userController.getProfile(authentication);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(profile);
        verify(userService).getUserProfile("user@example.com");
    }

    @Test
    @DisplayName("changePassword: returns 200 on successful password change")
    void changePassword_returns200() {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("old");
        request.setNewPassword("new");

        ResponseEntity<String> response = userController.changePassword(request, authentication);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(userService).changePassword("user@example.com", request);
    }

    @Test
    @DisplayName("updateProfilePicture: returns 200 and delegates to service")
    void updateProfilePicture_returns200() {
        UpdateProfilePictureRequest request = new UpdateProfilePictureRequest();
        request.setFotoPerfil("https://cdn.example.com/photo.jpg");

        ResponseEntity<String> response = userController.updateProfilePicture(request, authentication);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(userService).updateProfilePicture("user@example.com", request);
    }

    @Test
    @DisplayName("completeSurvey: passes genres and gender to service")
    void completeSurvey_delegatesCorrectly() {
        SurveyCompletedRequest request = new SurveyCompletedRequest();
        request.setFavoriteGenres(List.of("Pop", "Rock"));
        request.setGender("Female");

        ResponseEntity<String> response = userController.completeSurvey(request, authentication);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(userService).completeSurvey("user@example.com", List.of("Pop", "Rock"), "Female");
    }

    @Test
    @DisplayName("completeSurvey: passes null genres and gender when request body is null")
    void completeSurvey_handlesNullRequest() {
        ResponseEntity<String> response = userController.completeSurvey(null, authentication);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(userService).completeSurvey("user@example.com", null, null);
    }
}
