package com.aether.RadioAether.service;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.aether.RadioAether.model.dto.response.StationDTO;

/**
 * Radio service to charge the mock radio
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@Service
public class RadioService {

    public StationDTO getMockRadio() {
        return StationDTO.builder()
                .id(UUID.randomUUID().toString())
                .name("Los 40 Principales (España)")
                .streamUrl("https://21633.live.streamtheworld.com/LOS40_SC") // URL Real que funciona
                .logoUrl("https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Los_40.svg/3840px-Los_40.svg.png")
                .genre("Pop / Hits")
                .build();
    }
}

