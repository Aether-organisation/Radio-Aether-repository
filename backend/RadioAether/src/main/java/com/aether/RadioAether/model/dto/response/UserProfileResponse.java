package com.aether.RadioAether.model.dto.response;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserProfileResponse {
    private String nombre;
    private String email;
    private String fechaRegistro;
    private String fotoPerfil;
}
