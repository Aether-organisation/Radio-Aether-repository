package com.aether.RadioAether.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when an attempt is made to activate a featured station but the maximum
 * allowed number of simultaneously active stations (5) has already been reached.
 *
 * <p>Spring MVC maps this exception to an HTTP {@code 409 Conflict} response.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class MaxFeaturedStationsReachedException extends RuntimeException {

    /**
     * Constructs the exception with an explanatory message.
     *
     * @param message human-readable description of the limit violation
     */
    public MaxFeaturedStationsReachedException(String message) {
        super(message);
    }
}
