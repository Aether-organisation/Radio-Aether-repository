package com.aether.RadioAether.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.aether.RadioAether.model.dto.request.LocationRequest;
import com.aether.RadioAether.model.dto.response.StationDTO;
import com.aether.RadioAether.service.RadioService;

import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.Map;

/**
 * REST controller for radio-station discovery.
 *
 * <p>Provides endpoints for:
 * <ul>
 *   <li>Retrieving a fallback station ({@code GET /api/radio/mock}).</li>
 *   <li>Finding stations near a geographic position ({@code POST /api/radio/nearest}).</li>
 *   <li>Searching stations by name, genre or country ({@code GET /api/radio/search}).</li>
 *   <li>Returning personalised recommendations for the authenticated user
 *       ({@code GET /api/radio/foryou}).</li>
 * </ul>
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/radio")
@RequiredArgsConstructor
public class RadioController {

    private final RadioService radioService;

    /**
     * Returns a hardcoded fallback station used when no real station is available.
     *
     * @return a {@link ResponseEntity} containing the fallback {@link StationDTO}
     */
    @GetMapping("/mock")
    public ResponseEntity<StationDTO> getMockRadio() {
        return ResponseEntity.ok(radioService.getFallbackStation());
    }

    /**
     * Returns up to 10 stations nearest to the given geographic coordinates.
     * If no stations with geo-information are cached, the fallback station is returned.
     *
     * @param request body with {@code latitude} and {@code longitude} fields
     * @return {@code 200 OK} with a list of nearby {@link StationDTO}s, or
     *         {@code 400 Bad Request} if no stations are available
     */
    @PostMapping("/nearest")
    public ResponseEntity<?> getNearestStation(@RequestBody LocationRequest request) {
        List<StationDTO> recommendedStations = radioService.findNearestStation(request);

        if (recommendedStations == null || recommendedStations.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "No se puede acceder. No hay radios cercanas disponibles."));
        }

        return ResponseEntity.ok(recommendedStations);
    }

    /**
     * Searches stations on the Radio Browser API by the given query and filter type.
     *
     * @param q    the search term (minimum 2 characters)
     * @param type the filter type: {@code "name"} (default), {@code "genre"} or {@code "country"}
     * @return a {@link ResponseEntity} containing the list of matching {@link StationDTO}s,
     *         or {@code 400 Bad Request} if the query is too short
     */
    @GetMapping("/search")
    public ResponseEntity<List<StationDTO>> searchStations(
            @RequestParam String q,
            @RequestParam(defaultValue = "name") String type) {
        if (q == null || q.isBlank() || q.length() < 2) {
            return ResponseEntity.badRequest().build();
        }

        String formattedQuery = q.trim();
        if ("country".equalsIgnoreCase(type)) {
            String[] words = formattedQuery.toLowerCase().split("\\s+");
            StringBuilder sb = new StringBuilder();
            for (String word : words) {
                if (!word.isEmpty()) {
                    sb.append(Character.toUpperCase(word.charAt(0)));
                    sb.append(word.substring(1));
                    sb.append(" ");
                }
            }
            formattedQuery = sb.toString().trim();
        } else {
            formattedQuery = formattedQuery.toLowerCase();
        }

        return ResponseEntity.ok(radioService.searchStations(formattedQuery, type));
    }

    /**
     * Returns up to 10 stations tailored to the authenticated user's genre preferences
     * stored in their profile. If no preferences are set, popular stations are returned.
     *
     * @param authentication the current security context (resolved by Spring Security)
     * @return a {@link ResponseEntity} containing the personalised list of {@link StationDTO}s
     */
    @GetMapping("/foryou")
    public ResponseEntity<List<StationDTO>> getForYou(Authentication authentication) {
        String email = authentication.getName();
        List<StationDTO> stations = radioService.findForYou(email);
        return ResponseEntity.ok(stations);
    }
}
