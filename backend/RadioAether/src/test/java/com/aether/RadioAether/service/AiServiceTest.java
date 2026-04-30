package com.aether.RadioAether.service;

import com.aether.RadioAether.model.dto.StationDTO;
import com.aether.RadioAether.model.dto.response.MoodPlaylist;
import com.aether.RadioAether.model.dto.response.MoodPlaylistResponse;
import com.aether.RadioAether.model.dto.response.WeatherContext;
import com.aether.RadioAether.model.entity.User;
import com.aether.RadioAether.model.entity.UserPreferences;
import com.aether.RadioAether.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link AiService}.
 * Mocks the Spring AI ChatClient to avoid real API calls.
 * Covers mood playlist generation, context-aware playlists, all time-slot
 * branches in resolveTimeSlot, keyword fallback logic in getFallbackPlaylist,
 * and the error/fallback paths.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AiServiceTest {

    @Mock private RadioBrowserClient radioBrowserClient;
    @Mock private WeatherService weatherService;
    @Mock private UserRepository userRepository;
    @Mock private ChatClient chatClient;
    @Mock private ChatClient.ChatClientRequestSpec requestSpec;
    @Mock private ChatClient.CallResponseSpec callSpec;

    private AiService aiService;

    private MoodPlaylistResponse sampleAiResponse;
    private StationDTO sampleStation;

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setUp() {
        // Build ChatClient.Builder that returns our mock ChatClient
        ChatClient.Builder builder = mock(ChatClient.Builder.class);
        when(builder.build()).thenReturn(chatClient);

        aiService = new AiService(builder, radioBrowserClient, weatherService, userRepository);

        // Default ChatClient chain
        when(chatClient.prompt()).thenReturn(requestSpec);
        when(requestSpec.system(anyString())).thenReturn(requestSpec);
        when(requestSpec.user(anyString())).thenReturn(requestSpec);
        when(requestSpec.call()).thenReturn(callSpec);

        // Default AI response
        sampleAiResponse = new MoodPlaylistResponse();
        sampleAiResponse.setPlaylistTitle("Chill Vibes");
        sampleAiResponse.setPlaylistDescription("Perfect for relaxing");
        sampleAiResponse.setGenres(List.of("lofi"));
        sampleAiResponse.setTags(List.of("chill", "ambient"));
        sampleAiResponse.setMood("relaxed");

        sampleStation = StationDTO.builder()
                .id("s1").name("Lofi Radio").streamUrl("https://stream.lofi.com/live.mp3")
                .build();

        // Default weather
        when(weatherService.getWeather(anyDouble(), anyDouble()))
                .thenReturn(WeatherContext.builder().temperature(20.0).condition("sunny").build());

        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // getMoodPlaylist — happy path
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("getMoodPlaylist: returns playlist built from AI genres")
    @SuppressWarnings("unchecked")
    void getMoodPlaylist_returnsMoodPlaylist() {
        when(callSpec.entity(MoodPlaylistResponse.class)).thenReturn(sampleAiResponse);
        when(radioBrowserClient.getStationsByGenre("lofi")).thenReturn(List.of(sampleStation));

        MoodPlaylist result = aiService.getMoodPlaylist("I want to study");

        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Chill Vibes");
        assertThat(result.getStations()).isNotEmpty();
    }

    @Test
    @DisplayName("getMoodPlaylist: uses tags when genre returns fewer than 5 stations")
    @SuppressWarnings("unchecked")
    void getMoodPlaylist_usesTags_whenGenreInsufficientStations() {
        when(callSpec.entity(MoodPlaylistResponse.class)).thenReturn(sampleAiResponse);
        // Genre returns only 2 stations → triggers tag search
        when(radioBrowserClient.getStationsByGenre("lofi"))
                .thenReturn(List.of(sampleStation, sampleStation));
        when(radioBrowserClient.getStationsByGenre("chill"))
                .thenReturn(List.of(sampleStation, sampleStation, sampleStation));

        MoodPlaylist result = aiService.getMoodPlaylist("chill out");

        assertThat(result.getStations()).isNotEmpty();
        verify(radioBrowserClient).getStationsByGenre("chill");
    }

    @Test
    @DisplayName("getMoodPlaylist: deduplicates stations by ID")
    @SuppressWarnings("unchecked")
    void getMoodPlaylist_deduplicatesStationsById() {
        when(callSpec.entity(MoodPlaylistResponse.class)).thenReturn(sampleAiResponse);
        // Same station returned multiple times
        when(radioBrowserClient.getStationsByGenre("lofi"))
                .thenReturn(List.of(sampleStation, sampleStation, sampleStation));
        when(radioBrowserClient.getStationsByGenre(anyString())).thenReturn(List.of(sampleStation));

        MoodPlaylist result = aiService.getMoodPlaylist("study");

        // All stations with same ID are deduplicated
        long distinctIds = result.getStations().stream()
                .map(StationDTO::getId).distinct().count();
        assertThat(distinctIds).isEqualTo(result.getStations().size());
    }

    @Test
    @DisplayName("getMoodPlaylist: handles null genres in AI response gracefully")
    @SuppressWarnings("unchecked")
    void getMoodPlaylist_handlesNullGenres() {
        sampleAiResponse.setGenres(null);
        when(callSpec.entity(MoodPlaylistResponse.class)).thenReturn(sampleAiResponse);
        when(radioBrowserClient.getStationsByGenre(anyString())).thenReturn(List.of(sampleStation));

        MoodPlaylist result = aiService.getMoodPlaylist("music");

        assertThat(result).isNotNull();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // getMoodPlaylist — fallback (getFallbackPlaylist)
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("getMoodPlaylist: falls back to keyword search when AI throws")
    @SuppressWarnings("unchecked")
    void getMoodPlaylist_fallsBackOnAiException() {
        when(callSpec.entity(MoodPlaylistResponse.class))
                .thenThrow(new RuntimeException("AI quota exceeded"));
        when(radioBrowserClient.getStationsByGenre(anyString())).thenReturn(List.of(sampleStation));

        MoodPlaylist result = aiService.getMoodPlaylist("estudiar concentra");

        assertThat(result).isNotNull();
        // Fallback title includes the input text
        assertThat(result.getTitle()).contains("estudiar");
        verify(radioBrowserClient).getStationsByGenre("lofi");
    }

    @Test
    @DisplayName("getFallbackPlaylist: detects 'relax' keyword → chillout genre")
    @SuppressWarnings("unchecked")
    void getFallbackPlaylist_detectsRelaxKeyword() {
        when(callSpec.entity(MoodPlaylistResponse.class))
                .thenThrow(new RuntimeException("AI down"));
        when(radioBrowserClient.getStationsByGenre(anyString())).thenReturn(List.of(sampleStation));

        aiService.getMoodPlaylist("relax y descansar");

        verify(radioBrowserClient).getStationsByGenre("chillout");
    }

    @Test
    @DisplayName("getFallbackPlaylist: detects 'noche' keyword → ambient genre")
    @SuppressWarnings("unchecked")
    void getFallbackPlaylist_detectsNocheKeyword() {
        when(callSpec.entity(MoodPlaylistResponse.class))
                .thenThrow(new RuntimeException("AI down"));
        when(radioBrowserClient.getStationsByGenre(anyString())).thenReturn(List.of(sampleStation));

        aiService.getMoodPlaylist("música para la noche");

        verify(radioBrowserClient).getStationsByGenre("ambient");
    }

    @Test
    @DisplayName("getFallbackPlaylist: detects 'rock' keyword → rock genre")
    @SuppressWarnings("unchecked")
    void getFallbackPlaylist_detectsRockKeyword() {
        when(callSpec.entity(MoodPlaylistResponse.class))
                .thenThrow(new RuntimeException("AI down"));
        when(radioBrowserClient.getStationsByGenre(anyString())).thenReturn(List.of(sampleStation));

        aiService.getMoodPlaylist("quiero escuchar rock");

        verify(radioBrowserClient).getStationsByGenre("rock");
    }

    @Test
    @DisplayName("getFallbackPlaylist: detects 'feliz' keyword → pop genre")
    @SuppressWarnings("unchecked")
    void getFallbackPlaylist_detectsFelizKeyword() {
        when(callSpec.entity(MoodPlaylistResponse.class))
                .thenThrow(new RuntimeException("AI down"));
        when(radioBrowserClient.getStationsByGenre(anyString())).thenReturn(List.of(sampleStation));

        aiService.getMoodPlaylist("me siento feliz y alegre");

        verify(radioBrowserClient).getStationsByGenre("pop");
    }

    @Test
    @DisplayName("getFallbackPlaylist: detects 'jazz' keyword → jazz genre")
    @SuppressWarnings("unchecked")
    void getFallbackPlaylist_detectsJazzKeyword() {
        when(callSpec.entity(MoodPlaylistResponse.class))
                .thenThrow(new RuntimeException("AI down"));
        when(radioBrowserClient.getStationsByGenre(anyString())).thenReturn(List.of(sampleStation));

        aiService.getMoodPlaylist("jazz and blues tonight");

        verify(radioBrowserClient).getStationsByGenre("jazz");
    }

    @Test
    @DisplayName("getFallbackPlaylist: detects 'clásica' keyword → classical genre")
    @SuppressWarnings("unchecked")
    void getFallbackPlaylist_detectsClasicaKeyword() {
        when(callSpec.entity(MoodPlaylistResponse.class))
                .thenThrow(new RuntimeException("AI down"));
        when(radioBrowserClient.getStationsByGenre(anyString())).thenReturn(List.of(sampleStation));

        aiService.getMoodPlaylist("música clásica y orquesta");

        verify(radioBrowserClient).getStationsByGenre("classical");
    }

    @Test
    @DisplayName("getFallbackPlaylist: detects 'electronica' keyword → electronic genre")
    @SuppressWarnings("unchecked")
    void getFallbackPlaylist_detectsElectronicaKeyword() {
        when(callSpec.entity(MoodPlaylistResponse.class))
                .thenThrow(new RuntimeException("AI down"));
        when(radioBrowserClient.getStationsByGenre(anyString())).thenReturn(List.of(sampleStation));

        aiService.getMoodPlaylist("electronica y dance music");

        verify(radioBrowserClient).getStationsByGenre("electronic");
    }

    @Test
    @DisplayName("getFallbackPlaylist: defaults to chill when no keywords match")
    @SuppressWarnings("unchecked")
    void getFallbackPlaylist_defaultsToChill() {
        when(callSpec.entity(MoodPlaylistResponse.class))
                .thenThrow(new RuntimeException("AI down"));
        when(radioBrowserClient.getStationsByGenre("chill")).thenReturn(List.of(sampleStation));

        MoodPlaylist result = aiService.getMoodPlaylist("something completely unrelated");

        verify(radioBrowserClient).getStationsByGenre("chill");
        assertThat(result).isNotNull();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // getContextualPlaylist — resolveTimeSlot branches
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("getContextualPlaylist: resolves '06:00' to morning time slot")
    @SuppressWarnings("unchecked")
    void getContextualPlaylist_morningTimeSlot() {
        when(callSpec.entity(MoodPlaylistResponse.class)).thenReturn(sampleAiResponse);
        when(radioBrowserClient.getStationsByGenre(anyString())).thenReturn(List.of(sampleStation));

        MoodPlaylist result = aiService.getContextualPlaylist(40.4, -3.7, "06:30");

        assertThat(result).isNotNull();
        // Verify weather was called (means the method ran properly)
        verify(weatherService).getWeather(40.4, -3.7);
    }

    @Test
    @DisplayName("getContextualPlaylist: resolves '12:00' to midday time slot")
    @SuppressWarnings("unchecked")
    void getContextualPlaylist_middayTimeSlot() {
        when(callSpec.entity(MoodPlaylistResponse.class)).thenReturn(sampleAiResponse);
        when(radioBrowserClient.getStationsByGenre(anyString())).thenReturn(List.of(sampleStation));

        MoodPlaylist result = aiService.getContextualPlaylist(40.4, -3.7, "12:30");

        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("getContextualPlaylist: resolves '15:00' to afternoon time slot")
    @SuppressWarnings("unchecked")
    void getContextualPlaylist_afternoonTimeSlot() {
        when(callSpec.entity(MoodPlaylistResponse.class)).thenReturn(sampleAiResponse);
        when(radioBrowserClient.getStationsByGenre(anyString())).thenReturn(List.of(sampleStation));

        MoodPlaylist result = aiService.getContextualPlaylist(40.4, -3.7, "15:00");

        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("getContextualPlaylist: resolves '19:00' to evening time slot")
    @SuppressWarnings("unchecked")
    void getContextualPlaylist_eveningTimeSlot() {
        when(callSpec.entity(MoodPlaylistResponse.class)).thenReturn(sampleAiResponse);
        when(radioBrowserClient.getStationsByGenre(anyString())).thenReturn(List.of(sampleStation));

        MoodPlaylist result = aiService.getContextualPlaylist(40.4, -3.7, "19:00");

        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("getContextualPlaylist: resolves '22:00' to night time slot")
    @SuppressWarnings("unchecked")
    void getContextualPlaylist_nightTimeSlot() {
        when(callSpec.entity(MoodPlaylistResponse.class)).thenReturn(sampleAiResponse);
        when(radioBrowserClient.getStationsByGenre(anyString())).thenReturn(List.of(sampleStation));

        MoodPlaylist result = aiService.getContextualPlaylist(40.4, -3.7, "22:00");

        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("getContextualPlaylist: resolves '02:00' to night time slot (late night)")
    @SuppressWarnings("unchecked")
    void getContextualPlaylist_lateNightTimeSlot() {
        when(callSpec.entity(MoodPlaylistResponse.class)).thenReturn(sampleAiResponse);
        when(radioBrowserClient.getStationsByGenre(anyString())).thenReturn(List.of(sampleStation));

        MoodPlaylist result = aiService.getContextualPlaylist(40.4, -3.7, "02:00");

        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("getContextualPlaylist: resolves 'invalid' time to daytime fallback")
    @SuppressWarnings("unchecked")
    void getContextualPlaylist_invalidTimeFallsBackToDaytime() {
        when(callSpec.entity(MoodPlaylistResponse.class)).thenReturn(sampleAiResponse);
        when(radioBrowserClient.getStationsByGenre(anyString())).thenReturn(List.of(sampleStation));

        MoodPlaylist result = aiService.getContextualPlaylist(40.4, -3.7, "not-a-time");

        assertThat(result).isNotNull();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // getContextualPlaylist — loadCurrentUserGenres paths
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("getContextualPlaylist: uses empty genres when security context has no auth")
    @SuppressWarnings("unchecked")
    void getContextualPlaylist_usesEmptyGenresWhenNotAuthenticated() {
        when(callSpec.entity(MoodPlaylistResponse.class)).thenReturn(sampleAiResponse);
        when(radioBrowserClient.getStationsByGenre(anyString())).thenReturn(List.of(sampleStation));
        // Security context is empty (cleared in setUp)

        MoodPlaylist result = aiService.getContextualPlaylist(40.4, -3.7, "10:00");

        assertThat(result).isNotNull();
        // No user interaction when not authenticated
        verify(userRepository, never()).findByEmail(anyString());
    }

    @Test
    @DisplayName("getContextualPlaylist: loads favourite genres from authenticated user")
    @SuppressWarnings("unchecked")
    void getContextualPlaylist_loadsGenresFromAuthenticatedUser() {
        // Set up authenticated security context
        User user = User.builder()
                .email("user@example.com")
                .activo(true)
                .roles(new HashSet<>())
                .build();
        UserPreferences prefs = new UserPreferences();
        prefs.setFavoriteGenres(List.of("Jazz", "Blues"));
        user.setPreferences(prefs);

        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(user, null, List.of());
        SecurityContextHolder.getContext().setAuthentication(auth);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(callSpec.entity(MoodPlaylistResponse.class)).thenReturn(sampleAiResponse);
        when(radioBrowserClient.getStationsByGenre(anyString())).thenReturn(List.of(sampleStation));

        MoodPlaylist result = aiService.getContextualPlaylist(40.4, -3.7, "10:00");

        assertThat(result).isNotNull();
        verify(userRepository).findByEmail("user@example.com");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // getContextualPlaylist — error fallback (errorPlaylist)
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("getContextualPlaylist: returns error playlist when AI throws exception")
    @SuppressWarnings("unchecked")
    void getContextualPlaylist_returnsErrorPlaylistOnException() {
        when(callSpec.entity(MoodPlaylistResponse.class))
                .thenThrow(new RuntimeException("AI service unavailable"));

        MoodPlaylist result = aiService.getContextualPlaylist(40.4, -3.7, "10:00");

        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Sin resultados");
        assertThat(result.getStations()).isEmpty();
    }
}
