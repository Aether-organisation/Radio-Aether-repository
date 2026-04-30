package com.aether.RadioAether.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for {@link GlobalExceptionHandler}.
 * Exercises the RuntimeException handler mapping directly —
 * no Spring context required.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    @DisplayName("handleRuntimeException: returns HTTP 400 Bad Request")
    void handleRuntimeException_returns400() {
        ResponseEntity<Map<String, String>> response =
                handler.handleRuntimeException(new RuntimeException("Something broke"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    @DisplayName("handleRuntimeException: response body contains the exception message")
    void handleRuntimeException_bodyContainsMessage() {
        ResponseEntity<Map<String, String>> response =
                handler.handleRuntimeException(new RuntimeException("User not found"));

        assertThat(response.getBody())
                .isNotNull()
                .containsEntry("message", "User not found");
    }

    @Test
    @DisplayName("handleRuntimeException: works for custom RuntimeException subclasses")
    void handleRuntimeException_worksForSubclasses() {
        RuntimeException customEx = new IllegalStateException("Illegal state");

        ResponseEntity<Map<String, String>> response = handler.handleRuntimeException(customEx);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).containsEntry("message", "Illegal state");
    }
}
