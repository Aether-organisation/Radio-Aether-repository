package com.aether.RadioAether.controller;

import com.aether.RadioAether.model.dto.request.LoginRequest;
import com.aether.RadioAether.model.dto.request.RegisterRequest;
import com.aether.RadioAether.model.dto.response.AuthResponse;
import com.aether.RadioAether.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link AuthController}.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    @Test
    @DisplayName("initiateRegister: returns 200 and delegates to authService")
    void initiateRegister_returns200() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("user@example.com");
        request.setNombre("Test User");
        request.setPassword("password123");

        ResponseEntity<Void> response = authController.initiateRegister(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(authService).initiateRegister(request);
    }

    @Test
    @DisplayName("register: returns 200 with auth token on successful registration")
    void register_returns200WithToken() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("user@example.com");
        request.setPassword("password123");
        request.setVerificationCode("123456");

        AuthResponse authResponse = AuthResponse.builder()
                .token("eyJhbGciOiJIUzI1NiJ9.test.token")
                .surveyCompleted(false)
                .build();

        when(authService.register(request)).thenReturn(authResponse);

        ResponseEntity<AuthResponse> response = authController.register(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(authResponse);
        verify(authService).register(request);
    }

    @Test
    @DisplayName("login: returns 200 with auth token on successful login")
    void login_returns200WithToken() {
        LoginRequest request = new LoginRequest();
        request.setEmail("user@example.com");
        request.setPassword("password123");

        AuthResponse authResponse = AuthResponse.builder()
                .token("eyJhbGciOiJIUzI1NiJ9.test.token")
                .surveyCompleted(true)
                .build();

        when(authService.login(request)).thenReturn(authResponse);

        ResponseEntity<AuthResponse> response = authController.login(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(authResponse);
        verify(authService).login(request);
    }

    @Test
    @DisplayName("login: propagates exception when credentials are wrong")
    void login_propagatesExceptionOnBadCredentials() {
        LoginRequest request = new LoginRequest();
        request.setEmail("user@example.com");
        request.setPassword("wrongPassword");

        when(authService.login(request)).thenThrow(new RuntimeException("Bad credentials"));

        assertThatThrownBy(() -> authController.login(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Bad credentials");
    }
}
