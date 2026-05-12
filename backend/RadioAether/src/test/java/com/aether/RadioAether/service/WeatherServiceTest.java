package com.aether.RadioAether.service;

import com.aether.RadioAether.model.dto.response.WeatherContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriBuilder;
import org.springframework.web.util.UriComponentsBuilder;

import java.lang.reflect.Field;
import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link WeatherService}.
 * Uses reflection to inject a mock RestClient so that the OpenWeatherMap API
 * is never called during tests. Covers all mapped weather conditions and the
 * fallback behaviour on error.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@ExtendWith(MockitoExtension.class)
class WeatherServiceTest {

    private WeatherService weatherService;

    @SuppressWarnings("rawtypes")
    private RestClient.RequestHeadersUriSpec mockUriSpec;
    private RestClient.ResponseSpec mockResponseSpec;

    @BeforeEach
    @SuppressWarnings({"unchecked", "rawtypes"})
    void setUp() throws Exception {
        weatherService = new WeatherService("fake-api-key");

        RestClient mockRestClient = mock(RestClient.class);
        mockUriSpec = mock(RestClient.RequestHeadersUriSpec.class);
        mockResponseSpec = mock(RestClient.ResponseSpec.class);

        when(mockRestClient.get()).thenReturn(mockUriSpec);
        when(mockUriSpec.uri(any(Function.class))).thenAnswer(invocation -> {
            Function<UriBuilder, URI> fn = invocation.getArgument(0);
            fn.apply(UriComponentsBuilder.newInstance());
            return mockUriSpec;
        });
        when(mockUriSpec.retrieve()).thenReturn(mockResponseSpec);

        // Inject mock via reflection since RestClient is created inside the constructor
        Field field = WeatherService.class.getDeclaredField("restClient");
        field.setAccessible(true);
        field.set(weatherService, mockRestClient);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private void mockWeatherApiResponse(String owmCondition, double temp) {
        Map<String, Object> response = Map.of(
                "main", Map.of("temp", temp),
                "weather", List.of(Map.of("main", owmCondition))
        );
        when(mockResponseSpec.body(Map.class)).thenReturn(response);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Condition mapping
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("getWeather: maps 'Rain' OWM condition to 'rainy'")
    void getWeather_mapsRainToRainy() {
        mockWeatherApiResponse("Rain", 15.0);
        WeatherContext ctx = weatherService.getWeather(40.4, -3.7);
        assertThat(ctx.getCondition()).isEqualTo("rainy");
        assertThat(ctx.getTemperature()).isEqualTo(15.0);
    }

    @Test
    @DisplayName("getWeather: maps 'Drizzle' OWM condition to 'rainy'")
    void getWeather_mapsDrizzleToRainy() {
        mockWeatherApiResponse("Drizzle", 13.0);
        WeatherContext ctx = weatherService.getWeather(40.4, -3.7);
        assertThat(ctx.getCondition()).isEqualTo("rainy");
    }

    @Test
    @DisplayName("getWeather: maps 'Thunderstorm' OWM condition to 'stormy'")
    void getWeather_mapsThunderstormToStormy() {
        mockWeatherApiResponse("Thunderstorm", 18.0);
        WeatherContext ctx = weatherService.getWeather(40.4, -3.7);
        assertThat(ctx.getCondition()).isEqualTo("stormy");
    }

    @Test
    @DisplayName("getWeather: maps 'Snow' OWM condition to 'snowy'")
    void getWeather_mapsSnowToSnowy() {
        mockWeatherApiResponse("Snow", -2.0);
        WeatherContext ctx = weatherService.getWeather(40.4, -3.7);
        assertThat(ctx.getCondition()).isEqualTo("snowy");
        assertThat(ctx.getTemperature()).isEqualTo(-2.0);
    }

    @Test
    @DisplayName("getWeather: maps 'Clear' OWM condition to 'sunny'")
    void getWeather_mapsClearToSunny() {
        mockWeatherApiResponse("Clear", 28.0);
        WeatherContext ctx = weatherService.getWeather(40.4, -3.7);
        assertThat(ctx.getCondition()).isEqualTo("sunny");
    }

    @Test
    @DisplayName("getWeather: maps 'Clouds' OWM condition to 'cloudy'")
    void getWeather_mapsCloudsToCloud() {
        mockWeatherApiResponse("Clouds", 20.0);
        WeatherContext ctx = weatherService.getWeather(40.4, -3.7);
        assertThat(ctx.getCondition()).isEqualTo("cloudy");
    }

    @Test
    @DisplayName("getWeather: maps 'Fog' OWM condition to 'foggy'")
    void getWeather_mapsFogToFoggy() {
        mockWeatherApiResponse("Fog", 10.0);
        WeatherContext ctx = weatherService.getWeather(40.4, -3.7);
        assertThat(ctx.getCondition()).isEqualTo("foggy");
    }

    @Test
    @DisplayName("getWeather: maps 'Mist' OWM condition to 'foggy'")
    void getWeather_mapsMistToFoggy() {
        mockWeatherApiResponse("Mist", 11.0);
        WeatherContext ctx = weatherService.getWeather(40.4, -3.7);
        assertThat(ctx.getCondition()).isEqualTo("foggy");
    }

    @Test
    @DisplayName("getWeather: maps 'Haze' OWM condition to 'foggy'")
    void getWeather_mapsHazeToFoggy() {
        mockWeatherApiResponse("Haze", 22.0);
        WeatherContext ctx = weatherService.getWeather(40.4, -3.7);
        assertThat(ctx.getCondition()).isEqualTo("foggy");
    }

    @Test
    @DisplayName("getWeather: maps unknown OWM condition to 'cloudy' (default)")
    void getWeather_mapsUnknownConditionToCloudyDefault() {
        mockWeatherApiResponse("Tornado", 25.0);
        WeatherContext ctx = weatherService.getWeather(40.4, -3.7);
        assertThat(ctx.getCondition()).isEqualTo("cloudy");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Fallback behaviour
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("getWeather: returns fallback (20°C, sunny) when API throws an exception")
    void getWeather_returnsFallbackOnException() {
        when(mockResponseSpec.body(Map.class)).thenThrow(new RuntimeException("Connection timeout"));

        WeatherContext ctx = weatherService.getWeather(40.4, -3.7);

        assertThat(ctx.getCondition()).isEqualTo("sunny");
        assertThat(ctx.getTemperature()).isEqualTo(20.0);
    }

    @Test
    @DisplayName("getWeather: returns fallback when API returns null")
    void getWeather_returnsFallbackWhenResponseIsNull() {
        when(mockResponseSpec.body(Map.class)).thenReturn(null);

        WeatherContext ctx = weatherService.getWeather(40.4, -3.7);

        assertThat(ctx.getCondition()).isEqualTo("sunny");
        assertThat(ctx.getTemperature()).isEqualTo(20.0);
    }

    @Test
    @DisplayName("getWeather: temperature is read correctly from API response")
    void getWeather_readsTemperatureCorrectly() {
        mockWeatherApiResponse("Clear", 36.5);

        WeatherContext ctx = weatherService.getWeather(28.6, 77.2);

        assertThat(ctx.getTemperature()).isEqualTo(36.5);
    }
}
