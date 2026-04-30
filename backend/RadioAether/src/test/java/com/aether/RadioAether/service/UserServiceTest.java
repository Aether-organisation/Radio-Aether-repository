package com.aether.RadioAether.service;

import com.aether.RadioAether.model.dto.request.ChangePasswordRequest;
import com.aether.RadioAether.model.dto.request.UpdateProfilePictureRequest;
import com.aether.RadioAether.model.dto.response.UserProfileResponse;
import com.aether.RadioAether.model.entity.User;
import com.aether.RadioAether.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link UserService}.
 * Covers user profile retrieval, password change validation,
 * profile picture updates, and survey completion logic.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .idUsuario(1L)
                .nombre("Test User")
                .email("test@example.com")
                .password("$2a$10$hashedPassword")
                .fechaRegistro(LocalDateTime.of(2025, 1, 15, 10, 0))
                .fotoPerfil("https://example.com/photo.jpg")
                .activo(true)
                .surveyCompleted(false)
                .build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // getUserProfile
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("getUserProfile: returns all fields correctly mapped")
    void getUserProfile_returnsCorrectData() {
        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(sampleUser));

        UserProfileResponse response = userService.getUserProfile("test@example.com");

        assertThat(response.getNombre()).isEqualTo("Test User");
        assertThat(response.getEmail()).isEqualTo("test@example.com");
        assertThat(response.getFotoPerfil()).isEqualTo("https://example.com/photo.jpg");
        assertThat(response.getFechaRegistro()).isEqualTo("2025-01-15T10:00");
    }

    @Test
    @DisplayName("getUserProfile: fechaRegistro is null-safe when not set")
    void getUserProfile_nullFechaRegistroIsHandled() {
        sampleUser.setFechaRegistro(null);
        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(sampleUser));

        UserProfileResponse response = userService.getUserProfile("test@example.com");

        assertThat(response.getFechaRegistro()).isNull();
    }

    @Test
    @DisplayName("getUserProfile: throws RuntimeException when user not found")
    void getUserProfile_throwsWhenUserNotFound() {
        when(userRepository.findByEmail("unknown@example.com"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getUserProfile("unknown@example.com"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("User not found");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // changePassword
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("changePassword: new password is encoded before saving")
    void changePassword_encodesNewPassword() {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("oldPass");
        request.setNewPassword("newPass123");

        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("oldPass", sampleUser.getPassword()))
                .thenReturn(true);
        when(passwordEncoder.encode("newPass123"))
                .thenReturn("$2a$10$newHashedPassword");
        when(userRepository.save(any(User.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        userService.changePassword("test@example.com", request);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getPassword()).isEqualTo("$2a$10$newHashedPassword");
    }

    @Test
    @DisplayName("changePassword: raw new password is never stored")
    void changePassword_rawPasswordIsNeverStored() {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("oldPass");
        request.setNewPassword("newPass123");

        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("oldPass", sampleUser.getPassword()))
                .thenReturn(true);
        when(passwordEncoder.encode("newPass123"))
                .thenReturn("$2a$10$newHashedPassword");

        userService.changePassword("test@example.com", request);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getPassword()).doesNotContain("newPass123");
    }

    @Test
    @DisplayName("changePassword: throws when current password is incorrect")
    void changePassword_throwsWhenCurrentPasswordWrong() {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("wrongPass");
        request.setNewPassword("newPass123");

        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("wrongPass", sampleUser.getPassword()))
                .thenReturn(false);

        assertThatThrownBy(() -> userService.changePassword("test@example.com", request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Incorrect current password");

        // Make sure we never saved anything
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("changePassword: throws when user not found")
    void changePassword_throwsWhenUserNotFound() {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("pass");
        request.setNewPassword("newPass");

        when(userRepository.findByEmail("ghost@example.com"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.changePassword("ghost@example.com", request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("User not found");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // updateProfilePicture
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("updateProfilePicture: saves user with new URL")
    void updateProfilePicture_updatesUrl() {
        UpdateProfilePictureRequest request = new UpdateProfilePictureRequest();
        request.setFotoPerfil("https://cdn.example.com/new-photo.jpg");

        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(sampleUser));

        userService.updateProfilePicture("test@example.com", request);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getFotoPerfil())
                .isEqualTo("https://cdn.example.com/new-photo.jpg");
    }

    @Test
    @DisplayName("updateProfilePicture: throws when user not found")
    void updateProfilePicture_throwsWhenUserNotFound() {
        UpdateProfilePictureRequest request = new UpdateProfilePictureRequest();
        request.setFotoPerfil("https://example.com/photo.jpg");

        when(userRepository.findByEmail("nobody@example.com"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.updateProfilePicture("nobody@example.com", request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("User not found");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // completeSurvey
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("completeSurvey: marks surveyCompleted as true")
    void completeSurvey_marksSurveyCompleted() {
        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(sampleUser));

        userService.completeSurvey("test@example.com", List.of("Pop"), "Male");

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().isSurveyCompleted()).isTrue();
    }

    @Test
    @DisplayName("completeSurvey: sets gender when provided")
    void completeSurvey_setsGender() {
        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(sampleUser));

        userService.completeSurvey("test@example.com", null, "Female");

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getGenero()).isEqualTo("Female");
    }

    @Test
    @DisplayName("completeSurvey: does not overwrite gender when null")
    void completeSurvey_doesNotSetGenderWhenNull() {
        sampleUser.setGenero("Male");
        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(sampleUser));

        userService.completeSurvey("test@example.com", null, null);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getGenero()).isEqualTo("Male");
    }

    @Test
    @DisplayName("completeSurvey: creates preferences with provided genres")
    void completeSurvey_createsPreferencesWithGenres() {
        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(sampleUser));

        userService.completeSurvey("test@example.com", List.of("Pop", "Rock", "Jazz"), null);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getPreferences()).isNotNull();
        assertThat(captor.getValue().getPreferences().getFavoriteGenres())
                .containsExactlyInAnyOrder("Pop", "Rock", "Jazz");
    }

    @Test
    @DisplayName("completeSurvey: does not create preferences when genres list is null")
    void completeSurvey_doesNotCreatePrefsWhenGenresNull() {
        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(sampleUser));

        userService.completeSurvey("test@example.com", null, "Male");

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getPreferences()).isNull();
    }

    @Test
    @DisplayName("completeSurvey: does not create preferences when genres list is empty")
    void completeSurvey_doesNotCreatePrefsWhenGenresEmpty() {
        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(sampleUser));

        userService.completeSurvey("test@example.com", List.of(), "Male");

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getPreferences()).isNull();
    }

    @Test
    @DisplayName("completeSurvey: throws when user not found")
    void completeSurvey_throwsWhenUserNotFound() {
        when(userRepository.findByEmail("ghost@example.com"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.completeSurvey("ghost@example.com", List.of("Pop"), "Male"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("User not found");
    }
}
