package com.aether.RadioAether.controller;

import com.aether.RadioAether.model.dto.request.FeaturedStationRequestDTO;
import com.aether.RadioAether.model.dto.request.OdooWebhookDTO;
import com.aether.RadioAether.model.entity.FeaturedStation;
import com.aether.RadioAether.service.FeaturedStationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;
import java.util.List;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * REST controller for managing featured (promoted) radio stations.
 *
 * <p>The featured-station lifecycle is:
 * <ol>
 *   <li>A user submits a request via {@code POST /api/featured/request}.</li>
 *   <li>The request is forwarded to the Odoo back-office for review.</li>
 *   <li>Odoo notifies the backend via {@code POST /api/featured/webhook}.</li>
 *   <li>Approved stations become visible on the home screen through
 *       {@code GET /api/radio/featured}.</li>
 * </ol>
 *
 * @author prorix
 * @author mahoramas
 * @version 1.1.0
 */
@RestController
@RequiredArgsConstructor
public class FeaturedStationController {

    private final FeaturedStationService featuredStationService;

    /**
     * Returns the list of currently active featured stations.
     *
     * @return a {@link ResponseEntity} containing a list of active {@link FeaturedStation}s
     */
    @GetMapping("/api/radio/featured")
    public ResponseEntity<List<FeaturedStation>> getFeaturedStations() {
        final List<FeaturedStation> stations = featuredStationService.getActiveFeaturedStations();
        return ResponseEntity.ok(stations);
    }

    /**
     * Submits a request to feature a radio station.
     * The station is persisted locally and forwarded to Odoo for approval.
     *
     * @param request DTO containing the station metadata to promote
     * @return a {@link ResponseEntity} with the generated Odoo request UUID
     */
    @PostMapping("/api/featured/request")
    public ResponseEntity<String> requestFeaturedStation(@RequestBody final FeaturedStationRequestDTO request) {
        final String odooId = featuredStationService.requestFeaturedStation(request);
        return ResponseEntity.ok(odooId);
    }

    /**
     * Receives an Odoo webhook notification when a featured-station request is
     * approved or rejected.
     *
     * @param webhookDto DTO carrying the Odoo request ID and the approval flag
     * @return an empty {@code 200 OK} response
     */
    @PostMapping("/api/featured/webhook")
    public ResponseEntity<Void> handleWebhook(@RequestBody final OdooWebhookDTO webhookDto) {
        featuredStationService.approveWebhook(webhookDto);
        return ResponseEntity.ok().build();
    }

    /**
     * Returns the current status of a featured-station request by its Odoo UUID.
     *
     * @param id the Odoo request UUID
     * @return {@code 200 OK} with the {@link FeaturedStation} if found, or {@code 404 Not Found}
     */
    @GetMapping("/api/featured/status/{id}")
    public ResponseEntity<FeaturedStation> getRequestStatus(@PathVariable final String id) {
        return featuredStationService.getRequestStatus(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
