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

@RestController
@RequiredArgsConstructor
public class FeaturedStationController {

    private final FeaturedStationService featuredStationService;

    @GetMapping("/api/radio/featured")
    public ResponseEntity<List<FeaturedStation>> getFeaturedStations() {
        final List<FeaturedStation> stations = featuredStationService.getActiveFeaturedStations();
        return ResponseEntity.ok(stations);
    }

    @PostMapping("/api/featured/request")
    public ResponseEntity<String> requestFeaturedStation(@RequestBody final FeaturedStationRequestDTO request) {
        final String odooId = featuredStationService.requestFeaturedStation(request);
        return ResponseEntity.ok(odooId);
    }

    @PostMapping("/api/featured/webhook")
    public ResponseEntity<Void> handleWebhook(@RequestBody final OdooWebhookDTO webhookDto) {
        featuredStationService.approveWebhook(webhookDto);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/api/featured/status/{id}")
    public ResponseEntity<FeaturedStation> getRequestStatus(@PathVariable final String id) {
        return featuredStationService.getRequestStatus(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
