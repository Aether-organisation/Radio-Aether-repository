package com.aether.RadioAether.model.dto.request;
import lombok.Data;


/**
 * Login request DTO for user login
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@Data
public class LoginRequest {
    private String email;
    private String password;
}

