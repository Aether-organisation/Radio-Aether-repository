package com.aether.RadioAether.controller;

import com.aether.RadioAether.model.dto.request.LoginRequest;
import com.aether.RadioAether.model.dto.request.RegisterRequest;
import com.aether.RadioAether.model.dto.response.AuthResponse;
import com.aether.RadioAether.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for authentication
 * @author prorix
 * @author mahoramas
 * @version 1.1.0
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService service;

    /**
     * Phase 1: validate uniqueness and send verification email.
     * Body: { nombre, email, password }
     * Returns 200 OK on success (no token yet).
     */
    /**
     * Initiates the registration process by sending a verification code.
     *
     * @param request the registration details
     * @return an empty {@link ResponseEntity} indicating the email was sent
     */
    @PostMapping("/initiate-register")
    public ResponseEntity<Void> initiateRegister(@RequestBody RegisterRequest request) {
        service.initiateRegister(request);
        return ResponseEntity.ok().build();
    }

    /**
     * Phase 2: confirm the code and create the account.
     * Body: { nombre, email, password, verificationCode }
     * Returns a JWT + surveyCompleted flag on success.
     */
    /**
     * Registers a new user.
     *
     * @param request the registration details
     * @return a {@link ResponseEntity} with the authentication token
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(service.register(request));
    }

    /**
     * Authenticates an existing user and returns a JWT.
     *
     * @param request the login credentials
     * @return a {@link ResponseEntity} with the authentication token
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(service.login(request));
    }
}
