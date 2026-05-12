package com.aether.RadioAether.controller;

import com.aether.RadioAether.model.dto.request.FeaturedStationRequestDTO;
import com.aether.RadioAether.model.dto.request.OdooWebhookDTO;
import com.aether.RadioAether.model.entity.FeaturedStation;
import com.aether.RadioAether.service.FeaturedStationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link FeaturedStationController}.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@ExtendWith(MockitoExtension.class)
class FeaturedStationControllerTest {

    @Mock
    private FeaturedStationService featuredStationService;

    @InjectMocks
    private FeaturedStationController featuredStationController;

    @Test
    @DisplayName("getFeaturedStations: returns 200 with active stations list")
    void getFeaturedStations_returns200WithList() {
        FeaturedStation station = FeaturedStation.builder()
                .stationId("s1")
                .stationName("Featured FM")
                .isActive(true)
                .build();
        when(featuredStationService.getActiveFeaturedStations()).thenReturn(List.of(station));

        ResponseEntity<List<FeaturedStation>> response =
                featuredStationController.getFeaturedStations();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsExactly(station);
    }

    @Test
    @DisplayName("requestFeaturedStation: returns 200 with the generated request ID")
    void requestFeaturedStation_returns200WithId() {
        FeaturedStationRequestDTO request = new FeaturedStationRequestDTO(
                "s1", "Test FM", "https://stream.test.com", null, "Pop");
        when(featuredStationService.requestFeaturedStation(request))
                .thenReturn("odoo-request-id-123");

        ResponseEntity<String> response =
                featuredStationController.requestFeaturedStation(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo("odoo-request-id-123");
    }

    @Test
    @DisplayName("handleWebhook: returns 200 and delegates approval to service")
    void handleWebhook_returns200() {
        OdooWebhookDTO dto = new OdooWebhookDTO("request-id", true);

        ResponseEntity<Void> response = featuredStationController.handleWebhook(dto);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(featuredStationService).approveWebhook(dto);
    }

    @Test
    @DisplayName("getRequestStatus: returns 200 with station when found")
    void getRequestStatus_returns200WhenFound() {
        FeaturedStation station = FeaturedStation.builder()
                .stationId("s1")
                .stationName("Featured FM")
                .build();
        when(featuredStationService.getRequestStatus("request-id"))
                .thenReturn(Optional.of(station));

        ResponseEntity<FeaturedStation> response =
                featuredStationController.getRequestStatus("request-id");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(station);
    }

    @Test
    @DisplayName("getRequestStatus: returns 404 when station not found")
    void getRequestStatus_returns404WhenNotFound() {
        when(featuredStationService.getRequestStatus("nonexistent"))
                .thenReturn(Optional.empty());

        ResponseEntity<FeaturedStation> response =
                featuredStationController.getRequestStatus("nonexistent");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }
}
