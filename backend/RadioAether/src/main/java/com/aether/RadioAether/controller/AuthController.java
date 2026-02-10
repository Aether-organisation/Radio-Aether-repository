package com.aether.RadioAether.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aether.RadioAether.model.dto.request.LoginRequest;
import com.aether.RadioAether.model.dto.request.RegisterRequest;
import com.aether.RadioAether.model.dto.response.AuthResponse;
import com.aether.RadioAether.service.AuthService;

import lombok.RequiredArgsConstructor;

/**
 * Controller for authentication
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService service;

/**
 * TODO: implement error codes
 */

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(service.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(service.login(request));
    }
}
