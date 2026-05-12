package com.aether.RadioAether.model.dto.request;
import lombok.Data;

/**
 * Request payload for updating the user's profile picture.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@Data
public class UpdateProfilePictureRequest {
    private String fotoPerfil;
}
