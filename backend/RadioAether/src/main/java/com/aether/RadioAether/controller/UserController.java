package com.aether.RadioAether.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aether.RadioAether.model.dto.request.ChangePasswordRequest;
import com.aether.RadioAether.model.dto.request.UpdateProfilePictureRequest;
import com.aether.RadioAether.model.dto.response.UserProfileResponse;
import com.aether.RadioAether.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(userService.getUserProfile(email));
    }

    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(
            @RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        userService.changePassword(email, request);
        return ResponseEntity.ok("Password changed successfully");
    }

    @PutMapping("/profile-picture")
    public ResponseEntity<String> updateProfilePicture(
            @RequestBody UpdateProfilePictureRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        userService.updateProfilePicture(email, request);
        return ResponseEntity.ok("Profile picture updated successfully");
    }

    @PutMapping("/survey-completed")
    public ResponseEntity<String> completeSurvey(Authentication authentication) {
        String email = authentication.getName();
        userService.completeSurvey(email);
        return ResponseEntity.ok("Survey completed successfully");
    }
}
