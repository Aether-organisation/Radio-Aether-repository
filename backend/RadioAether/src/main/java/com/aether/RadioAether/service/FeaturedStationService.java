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

/**
 * Service for managing featured (promoted) radio stations.
 *
 * <p>Coordinates the full featured-station lifecycle:
 * <ol>
 *   <li>A station request is persisted locally and forwarded to Odoo for review.</li>
 *   <li>Odoo sends a webhook on approval; the station is then activated for 7 days.</li>
 *   <li>A scheduler (see {@code FeaturedStationScheduler}) deactivates expired stations.</li>
 * </ol>
 *
 * <p>The maximum number of simultaneously active featured stations is hard-capped at 5.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FeaturedStationService {

    private final FeaturedStationRepository featuredStationRepository;
    private final RestTemplate restTemplate;

    @Value("${ODOO_URL:http://odoo:8069}")
    private String odooUrl;

    /**
     * Persists a featured-station request in the database and forwards it to Odoo
     * for administrative review.
     *
     * <p>If Odoo is unreachable the local record is still saved; the request can be
     * approved manually later.
     *
     * @param requestDto DTO containing the station metadata submitted by the user
     * @return the generated UUID that identifies this request (used for status polling)
     */
    public String requestFeaturedStation(final FeaturedStationRequestDTO requestDto) {
        final String requestId = UUID.randomUUID().toString();
        final FeaturedStation station = FeaturedStation.builder()
                .stationId(requestDto.getStationId() != null && !requestDto.getStationId().isEmpty()
                        ? requestDto.getStationId()
                        : UUID.randomUUID().toString())
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
     * Sends the station request to the Odoo back-office via its JSON-RPC HTTP API.
     *
     * <p>Failures are caught and logged at WARN level so that they do not disrupt
     * the normal registration flow.
     *
     * @param station   the {@link FeaturedStation} entity that was just persisted
     * @param requestId the UUID assigned to this request
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
     * Returns the station associated with a given Odoo request UUID, regardless of
     * its current active/inactive state.
     *
     * @param requestId the UUID generated at request time
     * @return an {@link Optional} containing the {@link FeaturedStation}, or empty if not found
     */
    public Optional<FeaturedStation> getRequestStatus(final String requestId) {
        return featuredStationRepository.findByOdooRequestId(requestId);
    }

    /**
     * Processes an Odoo webhook that signals approval or rejection of a featured-station
     * request.
     *
     * <p>On approval, the station is activated for 7 days starting from now.
     * If the active station cap (5) has already been reached, a
     * {@link MaxFeaturedStationsReachedException} is thrown and the station remains inactive.
     *
     * @param webhookDto DTO carrying the Odoo request ID and the approval flag
     * @throws MaxFeaturedStationsReachedException if 5 or more stations are already active
     * @throws RuntimeException                    if no station is found for the given request ID
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

    /**
     * Returns all currently active featured stations.
     *
     * @return a list of active {@link FeaturedStation}s; never {@code null}
     */
    public List<FeaturedStation> getActiveFeaturedStations() {
        return featuredStationRepository.findByIsActiveTrue();
    }
}
