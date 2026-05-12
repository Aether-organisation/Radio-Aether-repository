package com.aether.RadioAether.service;

import com.aether.RadioAether.model.dto.response.WeatherContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

/**
 * Service that retrieves current weather data from the OpenWeatherMap API
 * and maps it to a simplified {@link WeatherContext} used by the AI playlist generator.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@Service
public class WeatherService {

    private final RestClient restClient;
    private final String apiKey;

    /**
     * Constructs the service and configures the underlying {@link RestClient}.
     *
     * @param apiKey the OpenWeatherMap API key (injected from {@code openweather.api-key})
     */
    public WeatherService(@Value("${openweather.api-key}") String apiKey) {
        this.apiKey = apiKey;
        this.restClient = RestClient.builder()
                .baseUrl("https://api.openweathermap.org")
                .build();
    }

    /**
     * Fetches current weather conditions for the given geographic coordinates.
     *
     * <p>If the API call fails for any reason (network error, invalid key, etc.) a
     * sensible fallback ({@code 20 °C, sunny}) is returned so that the AI pipeline
     * always has context to work with.
     *
     * @param latitude  the geographic latitude of the location
     * @param longitude the geographic longitude of the location
     * @return a {@link WeatherContext} with the temperature and a normalised condition string
     */
    public WeatherContext getWeather(double latitude, double longitude) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/data/2.5/weather")
                            .queryParam("lat", latitude)
                            .queryParam("lon", longitude)
                            .queryParam("appid", apiKey)
                            .queryParam("units", "metric")
                            .queryParam("lang", "en")
                            .build())
                    .retrieve()
                    .body(Map.class);

            if (response == null) {
                return fallback();
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> main = (Map<String, Object>) response.get("main");
            double temperature = ((Number) main.get("temp")).doubleValue();

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> weatherList = (List<Map<String, Object>>) response.get("weather");
            String owmMain = (String) weatherList.get(0).get("main");

            String condition = switch (owmMain) {
                case "Rain"         -> "rainy";
                case "Drizzle"      -> "rainy";
                case "Thunderstorm" -> "stormy";
                case "Snow"         -> "snowy";
                case "Clear"        -> "sunny";
                case "Clouds"       -> "cloudy";
                case "Fog", "Mist", "Haze" -> "foggy";
                default             -> "cloudy";
            };

            return WeatherContext.builder()
                    .temperature(temperature)
                    .condition(condition)
                    .build();

        } catch (Exception e) {
            return fallback();
        }
    }

    /**
     * Returns a default {@link WeatherContext} used when the API is unavailable.
     *
     * @return a sunny, 20 °C context
     */
    private WeatherContext fallback() {
        return WeatherContext.builder().temperature(20.0).condition("sunny").build();
    }
}
