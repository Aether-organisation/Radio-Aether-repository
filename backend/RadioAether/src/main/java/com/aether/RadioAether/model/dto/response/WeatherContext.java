package com.aether.RadioAether.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Snapshot of current weather conditions for AI contextual generation.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeatherContext {
    private double temperature;
    private String condition;
}
