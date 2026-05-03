package com.aether.RadioAether.model.dto.request;
import lombok.Data;

/**
     * Request payload for changing password.
     *
     * @author prorix
     * @author mahoramas
     * @version 1.0.0
     */
@Data
public class ChangePasswordRequest {
    private String currentPassword;
    private String newPassword;
}
