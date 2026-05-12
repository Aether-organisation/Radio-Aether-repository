package com.aether.RadioAether.model.dto.response;
import lombok.Builder;
import lombok.Data;

/**
 * Response payload containing the public profile of a user.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@Data
@Builder
public class UserProfileResponse {
    private String nombre;
    private String email;
    private String fechaRegistro;
    private String fotoPerfil;
}
