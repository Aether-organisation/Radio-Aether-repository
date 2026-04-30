package com.aether.RadioAether.service;

import com.aether.RadioAether.model.dto.request.LoginRequest;
import com.aether.RadioAether.model.dto.request.RegisterRequest;
import com.aether.RadioAether.model.dto.response.AuthResponse;
import com.aether.RadioAether.model.entity.Role;
import com.aether.RadioAether.model.entity.User;
import com.aether.RadioAether.model.enums.RoleName;
import com.aether.RadioAether.repository.RoleRepository;
import com.aether.RadioAether.repository.UserRepository;
import com.aether.RadioAether.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link AuthService}.
 * Covers registration initiation (uniqueness checks), full registration flow
 * (verification code validation), and login (JWT generation).
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private EmailVerificationService emailVerificationService;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest validRegisterRequest;
    private Role userRole;

    @BeforeEach
    void setUp() {
        validRegisterRequest = new RegisterRequest();
        validRegisterRequest.setEmail("new@radio.com");
        validRegisterRequest.setNombre("NewUser");
        validRegisterRequest.setPassword("securePass123");
        validRegisterRequest.setVerificationCode("123456");

        userRole = new Role();
        userRole.setName(RoleName.ROLE_USER);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // initiateRegister
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("initiateRegister: sends verification email for new unique user")
    void initiateRegister_sendsEmailForNewUser() {
        when(userRepository.existsByEmail("new@radio.com")).thenReturn(false);
        when(userRepository.existsByNombre("NewUser")).thenReturn(false);

        authService.initiateRegister(validRegisterRequest);

        verify(emailVerificationService).sendVerificationCode("new@radio.com");
    }

    @Test
    @DisplayName("initiateRegister: throws RuntimeException when email already exists")
    void initiateRegister_throwsWhenEmailTaken() {
        when(userRepository.existsByEmail("new@radio.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.initiateRegister(validRegisterRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("email ya está registrado");

        verify(emailVerificationService, never()).sendVerificationCode(any());
    }

    @Test
    @DisplayName("initiateRegister: throws RuntimeException when username already exists")
    void initiateRegister_throwsWhenUsernameTaken() {
        when(userRepository.existsByEmail("new@radio.com")).thenReturn(false);
        when(userRepository.existsByNombre("NewUser")).thenReturn(true);

        assertThatThrownBy(() -> authService.initiateRegister(validRegisterRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("nombre de usuario ya está en uso");

        verify(emailVerificationService, never()).sendVerificationCode(any());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // register
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("register: creates user and returns JWT when all checks pass")
    void register_createsUserAndReturnsJwt() {
        when(userRepository.existsByEmail("new@radio.com")).thenReturn(false);
        when(userRepository.existsByNombre("NewUser")).thenReturn(false);
        when(emailVerificationService.verifyCode("new@radio.com", "123456")).thenReturn(true);
        when(roleRepository.findByName(RoleName.ROLE_USER)).thenReturn(Optional.of(userRole));
        when(passwordEncoder.encode("securePass123")).thenReturn("hashed_password");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(jwtService.generateToken(any(User.class))).thenReturn("mock.jwt.token");

        AuthResponse response = authService.register(validRegisterRequest);

        assertThat(response.getToken()).isEqualTo("mock.jwt.token");
        verify(userRepository).save(any(User.class));
        verify(emailVerificationService).deleteCode("new@radio.com");
    }

    @Test
    @DisplayName("register: encodes the password before saving")
    void register_encodesPassword() {
        when(userRepository.existsByEmail("new@radio.com")).thenReturn(false);
        when(userRepository.existsByNombre("NewUser")).thenReturn(false);
        when(emailVerificationService.verifyCode("new@radio.com", "123456")).thenReturn(true);
        when(roleRepository.findByName(RoleName.ROLE_USER)).thenReturn(Optional.of(userRole));
        when(passwordEncoder.encode("securePass123")).thenReturn("hashed_password");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(jwtService.generateToken(any(User.class))).thenReturn("mock.jwt.token");

        authService.register(validRegisterRequest);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getPassword()).isEqualTo("hashed_password");
        assertThat(captor.getValue().getPassword()).isNotEqualTo("securePass123");
    }

    @Test
    @DisplayName("register: throws RuntimeException when verification code is invalid")
    void register_throwsWhenCodeInvalid() {
        when(userRepository.existsByEmail("new@radio.com")).thenReturn(false);
        when(userRepository.existsByNombre("NewUser")).thenReturn(false);
        when(emailVerificationService.verifyCode("new@radio.com", "123456")).thenReturn(false);

        assertThatThrownBy(() -> authService.register(validRegisterRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Código de verificación inválido");

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("register: throws RuntimeException when email already registered")
    void register_throwsWhenEmailAlreadyExists() {
        when(userRepository.existsByEmail("new@radio.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(validRegisterRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("email ya está registrado");
    }

    @Test
    @DisplayName("register: newly created user is active by default")
    void register_userIsActiveByDefault() {
        when(userRepository.existsByEmail("new@radio.com")).thenReturn(false);
        when(userRepository.existsByNombre("NewUser")).thenReturn(false);
        when(emailVerificationService.verifyCode("new@radio.com", "123456")).thenReturn(true);
        when(roleRepository.findByName(RoleName.ROLE_USER)).thenReturn(Optional.of(userRole));
        when(passwordEncoder.encode(any())).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(jwtService.generateToken(any(User.class))).thenReturn("token");

        authService.register(validRegisterRequest);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().isActivo()).isTrue();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // login
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("login: returns JWT token on valid credentials")
    void login_returnsJwtOnValidCredentials() {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("user@radio.com");
        loginRequest.setPassword("password123");

        User existingUser = User.builder()
                .email("user@radio.com")
                .password("hashed_password")
                .activo(true)
                .build();

        when(userRepository.findByEmail("user@radio.com")).thenReturn(Optional.of(existingUser));
        when(jwtService.generateToken(existingUser)).thenReturn("valid.jwt.token");

        AuthResponse response = authService.login(loginRequest);

        assertThat(response.getToken()).isEqualTo("valid.jwt.token");
        verify(authenticationManager).authenticate(
                any(UsernamePasswordAuthenticationToken.class)
        );
    }

    @Test
    @DisplayName("login: throws exception when credentials are wrong")
    void login_throwsOnBadCredentials() {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("user@radio.com");
        loginRequest.setPassword("wrongPassword");

        doThrow(new BadCredentialsException("Bad credentials"))
                .when(authenticationManager).authenticate(any());

        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(BadCredentialsException.class);

        verify(jwtService, never()).generateToken(any());
    }
}
