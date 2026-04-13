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
import java.util.List;

@Service
@RequiredArgsConstructor
public class FeaturedStationService {

    private final FeaturedStationRepository featuredStationRepository;

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
        return savedStation.getOdooRequestId();
    }

    public void approveWebhook(final OdooWebhookDTO webhookDto) {
        if (webhookDto.isApproved()) {
            final FeaturedStation station = featuredStationRepository.findByOdooRequestId(webhookDto.getOdooRequestId()).orElseThrow(() -> new RuntimeException("Station not found"));
            final long activeCount = featuredStationRepository.countByIsActiveTrue();

            if (activeCount < 5) {
                station.setActive(true);
                station.setFeaturedFrom(LocalDateTime.now());
                station.setFeaturedUntil(LocalDateTime.now().plusDays(7));
                featuredStationRepository.save(station);
            }
            if (activeCount >= 5) {
                throw new MaxFeaturedStationsReachedException("Max active featured stations limit reached (5)");
            }
        }
    }

    public List<FeaturedStation> getActiveFeaturedStations() {
        return featuredStationRepository.findByIsActiveTrue();
    }
}
