package com.aether.RadioAether.service;

import com.aether.RadioAether.model.entity.FeaturedStation;
import com.aether.RadioAether.model.dto.request.FeaturedStationRequestDTO;
import com.aether.RadioAether.model.dto.request.OdooWebhookDTO;
import com.aether.RadioAether.repository.FeaturedStationRepository;
import com.aether.RadioAether.exception.MaxFeaturedStationsReachedException;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;

@Service
@RequiredArgsConstructor
public class FeaturedStationService {

    private final FeaturedStationRepository featuredStationRepository;
    private final RestTemplate restTemplate;

    @Value("${ODOO_URL:http://odoo:8069}")
    private String odooUrl;


    public String requestFeaturedStation(final FeaturedStationRequestDTO requestDto) {
        final FeaturedStation station = FeaturedStation.builder()
                .stationId(requestDto.getStationId())
                .stationName(requestDto.getStationName())
                .streamUrl(requestDto.getStreamUrl())
                .logoUrl(requestDto.getLogoUrl())
                .genre(requestDto.getGenre())
                .isActive(false)
                .odooRequestId(UUID.randomUUID().toString())
                .build();

        final FeaturedStation savedStation = featuredStationRepository.save(station);
        
        // Intentar notificar a Odoo de forma asíncrona o directa (aquí simulamos la llamada lógica)
        try {
            // En un entorno real llamaríamos a la API XML-RPC de Odoo aquí
            // Por ahora, registramos el envío
            System.out.println("Enviando petición a Odoo para la radio: " + station.getStationName());
        } catch (Exception e) {
            System.err.println("Error al contactar con Odoo: " + e.getMessage());
        }

        return savedStation.getOdooRequestId();
    }

    public Optional<FeaturedStation> getRequestStatus(String requestId) {
        return featuredStationRepository.findByOdooRequestId(requestId);
    }


    public void approveWebhook(final OdooWebhookDTO webhookDto) {
        if (webhookDto.isApproved()) {
            final FeaturedStation station = featuredStationRepository.findByOdooRequestId(webhookDto.getOdooRequestId()).orElseThrow(() -> new RuntimeException("Station not found"));
            final long activeCount = featuredStationRepository.countByIsActiveTrue();

            if (activeCount >= 5) {
                throw new MaxFeaturedStationsReachedException("Max active featured stations limit reached (5)");
            } else {
                station.setActive(true);
                station.setFeaturedFrom(LocalDateTime.now());
                station.setFeaturedUntil(LocalDateTime.now().plusDays(7));
                featuredStationRepository.save(station);
            }
        }
    }

    public List<FeaturedStation> getActiveFeaturedStations() {
        return featuredStationRepository.findByIsActiveTrue();
    }
}
