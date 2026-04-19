package com.aether.RadioAether.service;

import com.aether.RadioAether.model.entity.FeaturedStation;
import com.aether.RadioAether.model.dto.request.FeaturedStationRequestDTO;
import com.aether.RadioAether.model.dto.request.OdooWebhookDTO;
import com.aether.RadioAether.repository.FeaturedStationRepository;
import com.aether.RadioAether.exception.MaxFeaturedStationsReachedException;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FeaturedStationService {

    private final FeaturedStationRepository featuredStationRepository;
    private final RestTemplate restTemplate;

    @Value("${ODOO_URL:http://odoo:8069}")
    private String odooUrl;

    /**
     * Guarda la solicitud en BD y la envía automáticamente al panel de Odoo.
     * @return el UUID de la solicitud (odooRequestId) para que el usuario lo guarde.
     */
    public String requestFeaturedStation(final FeaturedStationRequestDTO requestDto) {
        final String requestId = UUID.randomUUID().toString();
        final FeaturedStation station = FeaturedStation.builder()
                .stationId(requestDto.getStationId())
                .stationName(requestDto.getStationName())
                .streamUrl(requestDto.getStreamUrl())
                .logoUrl(requestDto.getLogoUrl())
                .genre(requestDto.getGenre())
                .isActive(false)
                .odooRequestId(requestId)
                .build();

        featuredStationRepository.save(station);
        log.info("[Aether] Solicitud guardada en BD para: {} (id={})", station.getStationName(), requestId);

        notifyOdoo(station, requestId);

        return requestId;
    }

    /**
     * Llama al endpoint HTTP de nuestro módulo de Odoo para crear la ficha allí.
     * Si Odoo no está disponible, el proceso NO se interrumpe — la solicitud
     * ya está guardada en la BD y puede aprobarse manualmente más tarde.
     */
    private void notifyOdoo(final FeaturedStation station, final String requestId) {
        try {
            final String odooEndpoint = odooUrl + "/aether/create_request";

            final Map<String, Object> params = new HashMap<>();
            params.put("stationName", station.getStationName());
            params.put("streamUrl", station.getStreamUrl());
            params.put("logoUrl",   station.getLogoUrl() != null ? station.getLogoUrl() : "");
            params.put("genre",     station.getGenre() != null ? station.getGenre() : "");
            params.put("requestId", requestId);

            final Map<String, Object> body = new HashMap<>();
            body.put("jsonrpc", "2.0");
            body.put("method", "call");
            body.put("params", params);

            final HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            final HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            final Map<?, ?> response = restTemplate.postForObject(odooEndpoint, entity, Map.class);
            log.info("[Aether] Respuesta de Odoo: {}", response);

        } catch (Exception e) {
            log.warn("[Aether] No se pudo contactar con Odoo ({}). La solicitud está guardada en BD. Error: {}",
                    odooUrl, e.getMessage());
        }
    }

    /**
     * Busca una solicitud por su UUID (pendiente O activa).
     * Lo usa la página de estado de Angular.
     */
    public Optional<FeaturedStation> getRequestStatus(final String requestId) {
        return featuredStationRepository.findByOdooRequestId(requestId);
    }

    /**
     * Procesamos el webhook de Odoo cuando el admin aprueba o rechaza.
     */
    public void approveWebhook(final OdooWebhookDTO webhookDto) {
        log.info("[Aether] Recibido webhook de Odoo. ID: {}, Aprobado: {}", 
                webhookDto.getOdooRequestId(), webhookDto.isApproved());

        if (webhookDto.isApproved()) {
            final FeaturedStation station = featuredStationRepository
                    .findByOdooRequestId(webhookDto.getOdooRequestId())
                    .orElseThrow(() -> new RuntimeException("Station not found: " + webhookDto.getOdooRequestId()));

            final long activeCount = featuredStationRepository.countByIsActiveTrue();
            log.info("[Aether] Radios activas actuales: {}", activeCount);

            if (activeCount >= 5) {
                log.warn("[Aether] No se puede activar: Límite de 5 alcanzado");
                throw new MaxFeaturedStationsReachedException("Max active featured stations limit reached (5)");
            }

            station.setActive(true);
            station.setFeaturedFrom(LocalDateTime.now());
            station.setFeaturedUntil(LocalDateTime.now().plusDays(7));
            
            featuredStationRepository.save(station);
            featuredStationRepository.flush(); 
            log.info("[Aether] ¡Radio ACTIVADA exitosamente!: {}", station.getStationName());
        } else {
            log.info("[Aether] La solicitud ha sido rechazada en Odoo.");
        }
    }

    public List<FeaturedStation> getActiveFeaturedStations() {
        return featuredStationRepository.findByIsActiveTrue();
    }
}
