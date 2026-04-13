package com.aether.RadioAether.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class MaxFeaturedStationsReachedException extends RuntimeException {
    public MaxFeaturedStationsReachedException(String message) {
        super(message);
    }
}
