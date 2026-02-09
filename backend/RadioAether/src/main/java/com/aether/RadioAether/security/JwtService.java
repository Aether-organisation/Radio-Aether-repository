package com.aether.RadioAether.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

/**
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@Service
public class JwtService {

    private final SecretKey key;
    private final long expirationMinutes;

    /**
     * Constructor para configuración JWT.
     *
     * @param secret            La clave secreta
     * @param expirationMinutes Minutos de expiración
     */
    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-minutes}") long expirationMinutes) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMinutes = expirationMinutes;
    }

    /**
     * Genera un token para el usuario.
     *
     * @param username El nombre de usuario
     * @return El token JWT
     */
    public String generateToken(String username) {
        Instant now = Instant.now();
        Instant exp = now.plusSeconds(expirationMinutes * 60);

        return Jwts.builder()
                .subject(username)
                .issuedAt(Date.from(now))
                .expiration(Date.from(exp))
                .signWith(key)
                .compact();
    }

    /**
     * Extrae el nombre de usuario del token.
     *
     * @param token El token JWT
     * @return El nombre de usuario
     */
    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    /**
     * Valida si el token no ha expirado.
     *
     * @param token El token JWT
     * @return true si es válido
     */
    public boolean isValid(String token) {
        try {
            Claims c = parseClaims(token);
            return c.getExpiration().after(new Date());
        } catch (Exception ex) {
            return false;
        }
    }

    /**
     * Valida el token completo contra los detalles de usuario.
     *
     * @param token       El token JWT
     * @param userDetails Los detalles del usuario
     * @return true si es válido
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && isValid(token);
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
