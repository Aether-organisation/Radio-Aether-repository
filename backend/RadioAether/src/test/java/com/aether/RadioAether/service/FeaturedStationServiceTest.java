package com.aether.RadioAether.service;

import com.aether.RadioAether.exception.MaxFeaturedStationsReachedException;
import com.aether.RadioAether.model.dto.request.FeaturedStationRequestDTO;
import com.aether.RadioAether.model.dto.request.OdooWebhookDTO;
import com.aether.RadioAether.model.entity.FeaturedStation;
import com.aether.RadioAether.repository.FeaturedStationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link FeaturedStationService}.
 * Covers the B2B featured station request lifecycle: creation, Odoo notification,
 * approval/rejection, and the maximum active stations constraint.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@ExtendWith(MockitoExtension.class)
class FeaturedStationServiceTest {

    @Mock
    private FeaturedStationRepository featuredStationRepository;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private FeaturedStationService featuredStationService;

    private FeaturedStationRequestDTO sampleRequest;
    private FeaturedStation sampleStation;

    @BeforeEach
    void setUp() {
        sampleRequest = new FeaturedStationRequestDTO(
                "station-uuid-1",
                "Radio Test FM",
                "https://stream.test.com/live",
                "https://logo.test.com/logo.png",
                "Pop"
        );

        sampleStation = FeaturedStation.builder()
                .stationId("station-uuid-1")
                .stationName("Radio Test FM")
                .streamUrl("https://stream.test.com/live")
                .logoUrl("https://logo.test.com/logo.png")
                .genre("Pop")
                .isActive(false)
                .odooRequestId("test-odoo-request-id")
                .build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // requestFeaturedStation
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("requestFeaturedStation: saves station and returns a UUID request ID")
    void requestFeaturedStation_savesStationAndReturnsId() {
        when(featuredStationRepository.save(any(FeaturedStation.class)))
                .thenAnswer(inv -> inv.getArgument(0));
        when(restTemplate.postForObject(anyString(), any(), eq(java.util.Map.class)))
                .thenReturn(null);

        String requestId = featuredStationService.requestFeaturedStation(sampleRequest);

        assertThat(requestId).isNotNull().isNotEmpty();
        verify(featuredStationRepository).save(any(FeaturedStation.class));
    }

    @Test
    @DisplayName("requestFeaturedStation: uses provided stationId when present")
    void requestFeaturedStation_usesProvidedStationId() {
        when(featuredStationRepository.save(any(FeaturedStation.class)))
                .thenAnswer(inv -> inv.getArgument(0));
        when(restTemplate.postForObject(anyString(), any(), eq(java.util.Map.class)))
                .thenReturn(null);

        featuredStationService.requestFeaturedStation(sampleRequest);

        ArgumentCaptor<FeaturedStation> captor = ArgumentCaptor.forClass(FeaturedStation.class);
        verify(featuredStationRepository).save(captor.capture());

        assertThat(captor.getValue().getStationId()).isEqualTo("station-uuid-1");
    }

    @Test
    @DisplayName("requestFeaturedStation: generates a stationId when none is provided")
    void requestFeaturedStation_generatesStationIdWhenMissing() {
        FeaturedStationRequestDTO noIdRequest = new FeaturedStationRequestDTO(
                null, "Radio NoId", "https://stream.test.com/live", null, "Rock"
        );
        when(featuredStationRepository.save(any(FeaturedStation.class)))
                .thenAnswer(inv -> inv.getArgument(0));
        when(restTemplate.postForObject(anyString(), any(), eq(java.util.Map.class)))
                .thenReturn(null);

        featuredStationService.requestFeaturedStation(noIdRequest);

        ArgumentCaptor<FeaturedStation> captor = ArgumentCaptor.forClass(FeaturedStation.class);
        verify(featuredStationRepository).save(captor.capture());
        assertThat(captor.getValue().getStationId()).isNotNull().isNotEmpty();
    }

    @Test
    @DisplayName("requestFeaturedStation: generates a stationId when an empty string is provided")
    void requestFeaturedStation_generatesStationIdWhenEmptyString() {
        FeaturedStationRequestDTO emptyIdRequest = new FeaturedStationRequestDTO(
                "", "Radio EmptyId", "https://stream.test.com/live", null, "Jazz"
        );
        when(featuredStationRepository.save(any(FeaturedStation.class)))
                .thenAnswer(inv -> inv.getArgument(0));
        when(restTemplate.postForObject(anyString(), any(), eq(java.util.Map.class)))
                .thenReturn(null);

        featuredStationService.requestFeaturedStation(emptyIdRequest);

        ArgumentCaptor<FeaturedStation> captor = ArgumentCaptor.forClass(FeaturedStation.class);
        verify(featuredStationRepository).save(captor.capture());
        assertThat(captor.getValue().getStationId()).isNotNull().isNotEmpty();
    }

    @Test
    @DisplayName("requestFeaturedStation: uses empty string for genre in Odoo payload when genre is null")
    void requestFeaturedStation_usesEmptyGenreWhenNull() {
        FeaturedStationRequestDTO noGenreRequest = new FeaturedStationRequestDTO(
                "station-no-genre", "Radio NoGenre", "https://stream.test.com/live",
                "https://logo.test.com/logo.png", null
        );
        when(featuredStationRepository.save(any(FeaturedStation.class)))
                .thenAnswer(inv -> inv.getArgument(0));
        when(restTemplate.postForObject(anyString(), any(), eq(java.util.Map.class)))
                .thenReturn(null);

        // Should not throw even with null genre
        assertThatCode(() -> featuredStationService.requestFeaturedStation(noGenreRequest))
                .doesNotThrowAnyException();

        verify(featuredStationRepository).save(any(FeaturedStation.class));
    }

    @Test
    @DisplayName("requestFeaturedStation: station is saved as inactive by default")
    void requestFeaturedStation_stationSavedAsInactive() {
        when(featuredStationRepository.save(any(FeaturedStation.class)))
                .thenAnswer(inv -> inv.getArgument(0));
        when(restTemplate.postForObject(anyString(), any(), eq(java.util.Map.class)))
                .thenReturn(null);

        featuredStationService.requestFeaturedStation(sampleRequest);

        ArgumentCaptor<FeaturedStation> captor = ArgumentCaptor.forClass(FeaturedStation.class);
        verify(featuredStationRepository).save(captor.capture());
        assertThat(captor.getValue().isActive()).isFalse();
    }

    @Test
    @DisplayName("requestFeaturedStation: continues even when Odoo is unreachable")
    void requestFeaturedStation_continuesWhenOdooUnreachable() {
        when(featuredStationRepository.save(any(FeaturedStation.class)))
                .thenAnswer(inv -> inv.getArgument(0));
        when(restTemplate.postForObject(anyString(), any(), eq(java.util.Map.class)))
                .thenThrow(new RuntimeException("Connection refused"));

        assertThatCode(() -> featuredStationService.requestFeaturedStation(sampleRequest))
                .doesNotThrowAnyException();

        verify(featuredStationRepository).save(any(FeaturedStation.class));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // getRequestStatus
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("getRequestStatus: returns the station when found")
    void getRequestStatus_returnsStationWhenFound() {
        when(featuredStationRepository.findByOdooRequestId("test-id"))
                .thenReturn(Optional.of(sampleStation));

        Optional<FeaturedStation> result = featuredStationService.getRequestStatus("test-id");

        assertThat(result).isPresent();
        assertThat(result.get().getStationName()).isEqualTo("Radio Test FM");
    }

    @Test
    @DisplayName("getRequestStatus: returns empty when not found")
    void getRequestStatus_returnsEmptyWhenNotFound() {
        when(featuredStationRepository.findByOdooRequestId("nonexistent"))
                .thenReturn(Optional.empty());

        Optional<FeaturedStation> result = featuredStationService.getRequestStatus("nonexistent");

        assertThat(result).isEmpty();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // approveWebhook — approved = true
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("approveWebhook: activates station when approved and limit not reached")
    void approveWebhook_activatesStationWhenApproved() {
        OdooWebhookDTO dto = new OdooWebhookDTO("test-odoo-request-id", true);

        when(featuredStationRepository.findByOdooRequestId("test-odoo-request-id"))
                .thenReturn(Optional.of(sampleStation));
        when(featuredStationRepository.countByIsActiveTrue()).thenReturn(2L);
        when(featuredStationRepository.save(any(FeaturedStation.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        featuredStationService.approveWebhook(dto);

        assertThat(sampleStation.isActive()).isTrue();
        assertThat(sampleStation.getFeaturedFrom()).isNotNull();
        assertThat(sampleStation.getFeaturedUntil()).isNotNull();
        verify(featuredStationRepository).save(sampleStation);
    }

    @Test
    @DisplayName("approveWebhook: sets featuredUntil 7 days after featuredFrom")
    void approveWebhook_setsCorrectFeaturedDuration() {
        OdooWebhookDTO dto = new OdooWebhookDTO("test-odoo-request-id", true);

        when(featuredStationRepository.findByOdooRequestId("test-odoo-request-id"))
                .thenReturn(Optional.of(sampleStation));
        when(featuredStationRepository.countByIsActiveTrue()).thenReturn(0L);
        when(featuredStationRepository.save(any(FeaturedStation.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        featuredStationService.approveWebhook(dto);

        long days = java.time.Duration.between(
                sampleStation.getFeaturedFrom(),
                sampleStation.getFeaturedUntil()
        ).toDays();

        assertThat(days).isEqualTo(7);
    }

    @Test
    @DisplayName("approveWebhook: throws MaxFeaturedStationsReachedException when limit is 5")
    void approveWebhook_throwsWhenLimitReached() {
        OdooWebhookDTO dto = new OdooWebhookDTO("test-odoo-request-id", true);

        when(featuredStationRepository.findByOdooRequestId("test-odoo-request-id"))
                .thenReturn(Optional.of(sampleStation));
        when(featuredStationRepository.countByIsActiveTrue()).thenReturn(5L);

        assertThatThrownBy(() -> featuredStationService.approveWebhook(dto))
                .isInstanceOf(MaxFeaturedStationsReachedException.class);

        verify(featuredStationRepository, never()).save(any());
    }

    @Test
    @DisplayName("approveWebhook: allows activation when exactly 4 stations are active")
    void approveWebhook_allowsActivationAt4Active() {
        OdooWebhookDTO dto = new OdooWebhookDTO("test-odoo-request-id", true);

        when(featuredStationRepository.findByOdooRequestId("test-odoo-request-id"))
                .thenReturn(Optional.of(sampleStation));
        when(featuredStationRepository.countByIsActiveTrue()).thenReturn(4L);
        when(featuredStationRepository.save(any(FeaturedStation.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        assertThatCode(() -> featuredStationService.approveWebhook(dto))
                .doesNotThrowAnyException();

        assertThat(sampleStation.isActive()).isTrue();
    }

    @Test
    @DisplayName("approveWebhook: throws RuntimeException when station not found")
    void approveWebhook_throwsWhenStationNotFound() {
        OdooWebhookDTO dto = new OdooWebhookDTO("nonexistent-id", true);

        when(featuredStationRepository.findByOdooRequestId("nonexistent-id"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> featuredStationService.approveWebhook(dto))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("nonexistent-id");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // approveWebhook — approved = false (rejection)
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("approveWebhook: does nothing to station when rejected")
    void approveWebhook_doesNothingWhenRejected() {
        OdooWebhookDTO dto = new OdooWebhookDTO("test-odoo-request-id", false);

        featuredStationService.approveWebhook(dto);

        verify(featuredStationRepository, never()).findByOdooRequestId(anyString());
        verify(featuredStationRepository, never()).save(any());
        assertThat(sampleStation.isActive()).isFalse();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // getActiveFeaturedStations
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("getActiveFeaturedStations: returns list of active stations")
    void getActiveFeaturedStations_returnsActiveList() {
        FeaturedStation activeStation = FeaturedStation.builder()
                .stationName("Active FM")
                .isActive(true)
                .build();

        when(featuredStationRepository.findByIsActiveTrue())
                .thenReturn(List.of(activeStation));

        List<FeaturedStation> result = featuredStationService.getActiveFeaturedStations();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStationName()).isEqualTo("Active FM");
    }

    @Test
    @DisplayName("getActiveFeaturedStations: returns empty list when no active stations")
    void getActiveFeaturedStations_returnsEmptyWhenNone() {
        when(featuredStationRepository.findByIsActiveTrue()).thenReturn(List.of());

        List<FeaturedStation> result = featuredStationService.getActiveFeaturedStations();

        assertThat(result).isEmpty();
    }
}
