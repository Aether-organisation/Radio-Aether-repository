package com.aether.RadioAether.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

/**
 * Json Web Token service
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@Service
public class JwtService {

    private final SecretKey key;
    private final long expirationMinutes;

    /**
     * Constructor for JWT configuration.
     *
     * @param secret            The secret key
     * @param expirationMinutes Expiration minutes
     */
    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-minutes}") long expirationMinutes) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMinutes = expirationMinutes;
    }

    /**
     * Generates a token for the user.
     *
     * @param userDetails The user details
     * @return The JWT token
     */
    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24))
                .signWith(this.key, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Extracts the username from the token.
     *
     * @param token The JWT token
     * @return The username
     */
    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    /**
     * Validates if the token has not expired.
     *
     * @param token The JWT token
     * @return true if valid
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
     * Validates the complete token against user details.
     *
     * @param token       The JWT token
     * @param userDetails The user details
     * @return true if valid
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
