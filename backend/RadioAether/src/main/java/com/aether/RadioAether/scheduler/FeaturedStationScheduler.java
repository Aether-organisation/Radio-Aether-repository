package com.aether.RadioAether.scheduler;

import com.aether.RadioAether.model.entity.FeaturedStation;
import com.aether.RadioAether.repository.FeaturedStationRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class FeaturedStationScheduler {

    private final FeaturedStationRepository featuredStationRepository;

    @Scheduled(fixedRate = 3600000)
    public void deactivateExpiredFeaturedStations() {
        final List<FeaturedStation> activeStations = featuredStationRepository.findByIsActiveTrue();
        final LocalDateTime now = LocalDateTime.now();

        for (FeaturedStation station : activeStations) {
            if (station.getFeaturedUntil() != null) {
                if (station.getFeaturedUntil().isBefore(now)) {
                    station.setActive(false);
                    featuredStationRepository.save(station);
                }
            }
        }
    }
}
