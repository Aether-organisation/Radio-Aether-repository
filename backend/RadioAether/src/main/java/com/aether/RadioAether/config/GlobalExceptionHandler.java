package com.aether.RadioAether.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

/**
 * Global exception handler for REST controllers
 * @author prorix
 * @author mahoramas
 * @version 1.0.2
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles any {@link RuntimeException} thrown by a controller and returns a
     * structured JSON error body with HTTP 400 Bad Request.
     *
     * @param ex the exception that was thrown
     * @return a {@link ResponseEntity} containing a {@code message} field with the
     *         exception message and HTTP status 400
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        String message = ex.getMessage();
        Map<String, String> response = Map.of("message", message);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
}
