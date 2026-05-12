package com.aether.RadioAether.scheduler;

import com.aether.RadioAether.model.entity.FeaturedStation;
import com.aether.RadioAether.repository.FeaturedStationRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link FeaturedStationScheduler}.
 * Verifies the expiry logic that deactivates featured stations
 * whose featuredUntil date has passed.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@ExtendWith(MockitoExtension.class)
class FeaturedStationSchedulerTest {

    @Mock
    private FeaturedStationRepository featuredStationRepository;

    @InjectMocks
    private FeaturedStationScheduler scheduler;

    @Test
    @DisplayName("deactivateExpired: deactivates stations whose featuredUntil is in the past")
    void deactivateExpired_deactivatesExpiredStation() {
        FeaturedStation expired = FeaturedStation.builder()
                .stationId("station-1")
                .stationName("Expired FM")
                .isActive(true)
                .featuredFrom(LocalDateTime.now().minusDays(8))
                .featuredUntil(LocalDateTime.now().minusMinutes(1))
                .build();

        when(featuredStationRepository.findByIsActiveTrue()).thenReturn(List.of(expired));

        scheduler.deactivateExpiredFeaturedStations();

        ArgumentCaptor<FeaturedStation> captor = ArgumentCaptor.forClass(FeaturedStation.class);
        verify(featuredStationRepository).save(captor.capture());
        assertThat(captor.getValue().isActive()).isFalse();
    }

    @Test
    @DisplayName("deactivateExpired: does not touch stations still within their active window")
    void deactivateExpired_doesNotDeactivateActiveStation() {
        FeaturedStation active = FeaturedStation.builder()
                .stationId("station-2")
                .stationName("Active FM")
                .isActive(true)
                .featuredFrom(LocalDateTime.now().minusDays(1))
                .featuredUntil(LocalDateTime.now().plusDays(6))
                .build();

        when(featuredStationRepository.findByIsActiveTrue()).thenReturn(List.of(active));

        scheduler.deactivateExpiredFeaturedStations();

        verify(featuredStationRepository, never()).save(any());
        assertThat(active.isActive()).isTrue();
    }

    @Test
    @DisplayName("deactivateExpired: does nothing when there are no active stations")
    void deactivateExpired_doesNothingWhenListIsEmpty() {
        when(featuredStationRepository.findByIsActiveTrue()).thenReturn(List.of());

        scheduler.deactivateExpiredFeaturedStations();

        verify(featuredStationRepository, never()).save(any());
    }

    @Test
    @DisplayName("deactivateExpired: skips stations with null featuredUntil")
    void deactivateExpired_skipsStationsWithNullFeaturedUntil() {
        FeaturedStation noExpiry = FeaturedStation.builder()
                .stationId("station-3")
                .stationName("Eternal FM")
                .isActive(true)
                .featuredUntil(null)
                .build();

        when(featuredStationRepository.findByIsActiveTrue()).thenReturn(List.of(noExpiry));

        scheduler.deactivateExpiredFeaturedStations();

        verify(featuredStationRepository, never()).save(any());
        assertThat(noExpiry.isActive()).isTrue();
    }

    @Test
    @DisplayName("deactivateExpired: processes a mixed list, deactivating only expired stations")
    void deactivateExpired_deactivatesOnlyExpiredFromMixedList() {
        FeaturedStation expired = FeaturedStation.builder()
                .stationId("station-expired")
                .stationName("Old FM")
                .isActive(true)
                .featuredUntil(LocalDateTime.now().minusHours(2))
                .build();

        FeaturedStation stillActive = FeaturedStation.builder()
                .stationId("station-active")
                .stationName("Live FM")
                .isActive(true)
                .featuredUntil(LocalDateTime.now().plusDays(3))
                .build();

        when(featuredStationRepository.findByIsActiveTrue())
                .thenReturn(List.of(expired, stillActive));

        scheduler.deactivateExpiredFeaturedStations();

        // Only the expired station should be saved
        ArgumentCaptor<FeaturedStation> captor = ArgumentCaptor.forClass(FeaturedStation.class);
        verify(featuredStationRepository, times(1)).save(captor.capture());
        assertThat(captor.getValue().getStationId()).isEqualTo("station-expired");
        assertThat(captor.getValue().isActive()).isFalse();
        assertThat(stillActive.isActive()).isTrue();
    }
}
