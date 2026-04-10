package com.aether.RadioAether.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aether.RadioAether.model.dto.request.LocationRequest;
import com.aether.RadioAether.model.dto.response.StationDTO;
import com.aether.RadioAether.service.RadioService;

import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.Map;

/**
 * Controller for handling radio-related requests.
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/radio")
@RequiredArgsConstructor
public class RadioController {

    private final RadioService radioService;

    @GetMapping("/mock")
    public ResponseEntity<StationDTO> getMockRadio() {
        return ResponseEntity.ok(radioService.getFallbackStation());
    }

    @PostMapping("/nearest")
    public ResponseEntity<?> getNearestStation(@RequestBody LocationRequest request) {
        List<StationDTO> recommendedStations = radioService.findNearestStation(request);
        
        if (recommendedStations == null || recommendedStations.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "No se puede acceder. No hay radios cercanas disponibles."));
        }
        
        return ResponseEntity.ok(recommendedStations);
    }

    @GetMapping("/foryou")
    public ResponseEntity<List<StationDTO>> getForYou(Authentication authentication) {
        String email = authentication.getName();
        List<StationDTO> stations = radioService.findForYou(email);
        return ResponseEntity.ok(stations);
    }
}

