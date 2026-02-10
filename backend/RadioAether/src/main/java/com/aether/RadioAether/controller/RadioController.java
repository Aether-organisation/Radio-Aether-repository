package com.aether.RadioAether.controller;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aether.RadioAether.model.dto.response.StationDTO;
import com.aether.RadioAether.service.RadioService;

import lombok.RequiredArgsConstructor;

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
        return ResponseEntity.ok(radioService.getMockRadio());
    }
}

