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
    /** The 6-digit code the user received by email. Null during initiation phase. */
    private String verificationCode;
}

