package com.aether.RadioAether.model.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for {@link Station}.
 * Exercises Lombok-generated methods (builder, getters/setters, equals, hashCode,
 * toString) to ensure meaningful JaCoCo coverage of the entity's auto-generated code.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
class StationEntityTest {

    @Test
    @DisplayName("builder: creates instance with expected field values")
    void builder_createsInstanceWithExpectedValues() {
        UUID id = UUID.randomUUID();
        Station station = Station.builder()
                .id(id)
                .nombre("Radio Test FM")
                .streamUrl("https://stream.test.com/live")
                .logoURL("https://logo.test.com/img.png")
                .generoPrincipal("Pop")
                .latitud(40.4168)
                .longitud(-3.7038)
                .pais("Spain")
                .build();

        assertThat(station.getId()).isEqualTo(id);
        assertThat(station.getNombre()).isEqualTo("Radio Test FM");
        assertThat(station.getStreamUrl()).isEqualTo("https://stream.test.com/live");
        assertThat(station.getLogoURL()).isEqualTo("https://logo.test.com/img.png");
        assertThat(station.getGeneroPrincipal()).isEqualTo("Pop");
        assertThat(station.getLatitud()).isEqualTo(40.4168);
        assertThat(station.getLongitud()).isEqualTo(-3.7038);
        assertThat(station.getPais()).isEqualTo("Spain");
    }

    @Test
    @DisplayName("noArgsConstructor: creates instance with null/default fields")
    void noArgsConstructor_createsEmptyInstance() {
        Station station = new Station();
        assertThat(station.getId()).isNull();
        assertThat(station.getNombre()).isNull();
    }

    @Test
    @DisplayName("allArgsConstructor: creates instance with all provided values")
    void allArgsConstructor_createsInstanceWithAllValues() {
        UUID id = UUID.randomUUID();
        Station station = new Station(id, "Jazz FM", "https://jazz.com/live",
                "https://jazz.com/logo.png", "Jazz", 48.8566, 2.3522, "France");

        assertThat(station.getNombre()).isEqualTo("Jazz FM");
        assertThat(station.getPais()).isEqualTo("France");
    }

    @Test
    @DisplayName("setters: mutate fields correctly")
    void setters_mutateFieldsCorrectly() {
        Station station = new Station();
        station.setNombre("Rock Radio");
        station.setStreamUrl("https://rock.com/live");
        station.setGeneroPrincipal("Rock");
        station.setLatitud(51.5074);
        station.setLongitud(-0.1278);
        station.setPais("United Kingdom");
        station.setLogoURL("https://rock.com/logo.png");

        assertThat(station.getNombre()).isEqualTo("Rock Radio");
        assertThat(station.getGeneroPrincipal()).isEqualTo("Rock");
        assertThat(station.getPais()).isEqualTo("United Kingdom");
    }

    @Test
    @DisplayName("equals: two instances with same data are equal")
    void equals_sameDataAreEqual() {
        UUID id = UUID.randomUUID();
        Station a = Station.builder().id(id).nombre("FM Radio").build();
        Station b = Station.builder().id(id).nombre("FM Radio").build();

        assertThat(a).isEqualTo(b);
    }

    @Test
    @DisplayName("hashCode: instances with same data have the same hashCode")
    void hashCode_sameDataProducesSameHashCode() {
        UUID id = UUID.randomUUID();
        Station a = Station.builder().id(id).nombre("Hits FM").build();
        Station b = Station.builder().id(id).nombre("Hits FM").build();

        assertThat(a.hashCode()).isEqualTo(b.hashCode());
    }

    @Test
    @DisplayName("toString: contains class name and station name")
    void toString_containsClassNameAndStationName() {
        Station station = Station.builder().nombre("Lofi Radio").build();
        String result = station.toString();

        assertThat(result).contains("Station");
        assertThat(result).contains("Lofi Radio");
    }
}
