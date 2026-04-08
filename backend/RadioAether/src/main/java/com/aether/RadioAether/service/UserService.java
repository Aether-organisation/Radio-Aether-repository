package com.aether.RadioAether.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.aether.RadioAether.model.dto.request.ChangePasswordRequest;
import com.aether.RadioAether.model.dto.request.UpdateProfilePictureRequest;
import com.aether.RadioAether.model.dto.response.UserProfileResponse;
import com.aether.RadioAether.model.entity.User;
import com.aether.RadioAether.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserProfileResponse getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return UserProfileResponse.builder()
                .nombre(user.getNombre())
                .email(user.getEmail())
                .fechaRegistro(user.getFechaRegistro() != null ? user.getFechaRegistro().toString() : null)
                .fotoPerfil(user.getFotoPerfil())
                .build();
    }

    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Incorrect current password");
        }
        
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public void updateProfilePicture(String email, UpdateProfilePictureRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setFotoPerfil(request.getFotoPerfil());
        userRepository.save(user);
    }

    public void completeSurvey(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setSurveyCompleted(true);
        userRepository.save(user);
    }
}
