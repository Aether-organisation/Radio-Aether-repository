package com.aether.RadioAether.model.dto.request;

import lombok.Data;

/**
 * Register request DTO for user registration
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@Data
public class RegisterRequest {
    private String nombre;
    private String email;
    private String password;
}

