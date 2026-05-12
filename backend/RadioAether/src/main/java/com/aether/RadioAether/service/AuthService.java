package com.aether.RadioAether.service;

import java.time.LocalDateTime;
import java.util.Set;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.aether.RadioAether.model.dto.request.LoginRequest;
import com.aether.RadioAether.model.dto.request.RegisterRequest;
import com.aether.RadioAether.model.dto.response.AuthResponse;
import com.aether.RadioAether.model.entity.Role;
import com.aether.RadioAether.model.entity.User;
import com.aether.RadioAether.model.enums.RoleName;
import com.aether.RadioAether.repository.RoleRepository;
import com.aether.RadioAether.repository.UserRepository;
import com.aether.RadioAether.security.JwtService;

import lombok.RequiredArgsConstructor;

/**
 * Authentication service
 * @author prorix
 * @author mahoramas
 * @version 1.1.0
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailVerificationService emailVerificationService;

    /**
     * Initiates registration: validates uniqueness, sends the verification email
     * and returns without creating the user yet.
     */
    /**
     * Initiates the registration process.
     *
     * @param request the registration details
     */
    public void initiateRegister(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Error: El email ya está registrado.");
        }

        if (userRepository.existsByNombre(request.getNombre())) {
            throw new RuntimeException("Error: El nombre de usuario ya está en uso.");
        }

        emailVerificationService.sendVerificationCode(request.getEmail());
    }

    /**
     * Completes registration after the user has verified their email code.
     */
    /**
     * Completes registration.
     *
     * @param request the registration details
     * @return an {@link AuthResponse} containing the JWT
     */
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Error: El email ya está registrado.");
        }

        if (userRepository.existsByNombre(request.getNombre())) {
            throw new RuntimeException("Error: El nombre de usuario ya está en uso.");
        }

        // Confirm the code was validated (marked as verified)
        boolean codeOk = emailVerificationService.verifyCode(request.getEmail(), request.getVerificationCode());
        if (!codeOk) {
            throw new RuntimeException("Error: Código de verificación inválido o caducado.");
        }

        Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Error: Role not found."));

        User user = User.builder()
                .nombre(request.getNombre())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fechaRegistro(LocalDateTime.now())
                .activo(true)
                .roles(Set.of(userRole))
                .build();

        userRepository.save(user);
        emailVerificationService.deleteCode(request.getEmail());

        String jwtToken = jwtService.generateToken(user);
        return AuthResponse.builder().token(jwtToken).surveyCompleted(user.isSurveyCompleted()).build();
    }

    /**
     * Authenticates a user.
     *
     * @param request the login credentials
     * @return an {@link AuthResponse} containing the JWT
     */
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();

        String jwtToken = jwtService.generateToken(user);
        return AuthResponse.builder().token(jwtToken).surveyCompleted(user.isSurveyCompleted()).build();
    }
}