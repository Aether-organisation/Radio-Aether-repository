package com.aether.RadioAether.service;

import com.aether.RadioAether.model.dto.response.WeatherContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class WeatherService {

    private final RestClient restClient;
    private final String apiKey;

    public WeatherService(@Value("${openweather.api-key}") String apiKey) {
        this.apiKey = apiKey;
        this.restClient = RestClient.builder()
                .baseUrl("https://api.openweathermap.org")
                .build();
    }

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

    private WeatherContext fallback() {
        return WeatherContext.builder().temperature(20.0).condition("sunny").build();
    }
}
