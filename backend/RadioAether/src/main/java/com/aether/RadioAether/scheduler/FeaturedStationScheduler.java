package com.aether.RadioAether.scheduler;

import com.aether.RadioAether.model.entity.FeaturedStation;
import com.aether.RadioAether.repository.FeaturedStationRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduled task that automatically deactivates featured stations whose promotion
 * period has expired.
 *
 * <p>Runs every hour ({@code fixedRate = 3 600 000 ms}) and sets {@code active = false}
 * on any {@link FeaturedStation} whose {@code featuredUntil} timestamp is in the past.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@Component
@RequiredArgsConstructor
public class FeaturedStationScheduler {

    private final FeaturedStationRepository featuredStationRepository;

    /**
     * Iterates over all currently active featured stations and deactivates those
     * whose {@code featuredUntil} date has passed.
     *
     * <p>This method is invoked automatically by Spring's task scheduler every hour.
     */
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
