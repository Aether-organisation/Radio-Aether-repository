package com.aether.RadioAether.security;

import com.aether.RadioAether.model.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.HashSet;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for {@link JwtService}.
 * Covers token generation, extraction, expiry, and validation logic.
 * Uses a fixed secret key so tests run without Spring context.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
class JwtServiceTest {

    // 32+ characters so HMAC-SHA256 accepts it
    private static final String TEST_SECRET =
            "test-secret-key-for-unit-tests-1234567890abcdef";
    private static final long EXPIRY_MINUTES = 60L;

    private JwtService jwtService;
    private UserDetails sampleUser;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(TEST_SECRET, EXPIRY_MINUTES);

        sampleUser = User.builder()
                .idUsuario(1L)
                .nombre("Test User")
                .email("test@example.com")
                .password("hashed-password")
                .activo(true)
                .roles(new HashSet<>())
                .build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Token generation
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("generateToken: produces a non-null, non-blank JWT string")
    void generateToken_producesNonBlankToken() {
        String token = jwtService.generateToken(sampleUser);
        assertThat(token).isNotNull().isNotBlank();
    }

    @Test
    @DisplayName("generateToken: token has the expected 3-part JWT structure")
    void generateToken_hasThreePartStructure() {
        String token = jwtService.generateToken(sampleUser);
        // Header.Payload.Signature
        assertThat(token.split("\\.")).hasSize(3);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Username extraction
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("extractUsername: returns the email that was used as subject")
    void extractUsername_returnsEmail() {
        String token = jwtService.generateToken(sampleUser);
        String username = jwtService.extractUsername(token);
        assertThat(username).isEqualTo("test@example.com");
    }

    @Test
    @DisplayName("extractUsername: differs for different users")
    void extractUsername_differsByUser() {
        UserDetails otherUser = User.builder()
                .email("other@example.com")
                .activo(true)
                .roles(new HashSet<>())
                .build();

        String token1 = jwtService.generateToken(sampleUser);
        String token2 = jwtService.generateToken(otherUser);

        assertThat(jwtService.extractUsername(token1))
                .isNotEqualTo(jwtService.extractUsername(token2));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Validity checks
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("isValid: freshly generated token is valid")
    void isValid_freshTokenIsValid() {
        String token = jwtService.generateToken(sampleUser);
        assertThat(jwtService.isValid(token)).isTrue();
    }

    @Test
    @DisplayName("isValid: returns false for a tampered token")
    void isValid_returnsFalseForTamperedToken() {
        String token = jwtService.generateToken(sampleUser);
        // Alter the signature part
        String[] parts = token.split("\\.");
        String tampered = parts[0] + "." + parts[1] + ".invalidsignature";
        assertThat(jwtService.isValid(tampered)).isFalse();
    }

    @Test
    @DisplayName("isValid: returns false for a completely malformed token")
    void isValid_returnsFalseForGarbage() {
        assertThat(jwtService.isValid("not.a.jwt")).isFalse();
    }

    @Test
    @DisplayName("isTokenValid: true when username matches and token is fresh")
    void isTokenValid_trueForMatchingUser() {
        String token = jwtService.generateToken(sampleUser);
        assertThat(jwtService.isTokenValid(token, sampleUser)).isTrue();
    }

    @Test
    @DisplayName("isTokenValid: false when username does not match")
    void isTokenValid_falseForWrongUser() {
        UserDetails otherUser = User.builder()
                .email("imposter@example.com")
                .activo(true)
                .roles(new HashSet<>())
                .build();

        String token = jwtService.generateToken(sampleUser);
        assertThat(jwtService.isTokenValid(token, otherUser)).isFalse();
    }

    @Test
    @DisplayName("isTokenValid: a token signed with a different secret is rejected")
    void isTokenValid_rejectsDifferentSecret() {
        JwtService otherService = new JwtService(
                "completely-different-secret-key-abcdefghijkl", EXPIRY_MINUTES);
        String foreignToken = otherService.generateToken(sampleUser);

        // Our service should reject a token signed by a different key
        assertThat(jwtService.isValid(foreignToken)).isFalse();
    }

    @Test
    @DisplayName("generateToken: tokens for different users are always different")
    void generateToken_differentUsersProduceDifferentTokens() {
        UserDetails otherUser = User.builder()
                .email("different@example.com")
                .activo(true)
                .roles(new HashSet<>())
                .build();

        String token1 = jwtService.generateToken(sampleUser);
        String token2 = jwtService.generateToken(otherUser);
        assertThat(token1).isNotEqualTo(token2);
    }
}
