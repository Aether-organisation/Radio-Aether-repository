package com.aether.RadioAether.controller;

import com.aether.RadioAether.model.dto.response.MoodPlaylist;
import com.aether.RadioAether.service.AiService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Unit tests for {@link AiController}.
 * Uses {@link MockMvc} standalone setup to send HTTP requests without a full Spring context,
 * which also exercises the private {@code MoodRequest} and {@code ContextualRequest} records
 * via Jackson JSON deserialization.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@ExtendWith(MockitoExtension.class)
class AiControllerTest {

    @Mock
    private AiService aiService;

    @InjectMocks
    private AiController aiController;

    private MockMvc mockMvc;
    private MoodPlaylist samplePlaylist;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(aiController).build();
        samplePlaylist = MoodPlaylist.builder()
                .title("Chill Vibes")
                .description("Perfect for relaxing")
                .stations(List.of())
                .build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/ai/mood
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("getMoodPlaylist: returns 200 and delegates text to AiService")
    void getMoodPlaylist_returns200AndDelegatesText() throws Exception {
        when(aiService.getMoodPlaylist("feliz")).thenReturn(samplePlaylist);

        mockMvc.perform(post("/api/ai/mood")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"text\": \"feliz\"}"))
                .andExpect(status().isOk());

        verify(aiService).getMoodPlaylist("feliz");
    }

    @Test
    @DisplayName("getMoodPlaylist: response body contains title from service result")
    void getMoodPlaylist_responseTitleMatchesServiceResult() throws Exception {
        MoodPlaylist rockPlaylist = MoodPlaylist.builder()
                .title("Rock Session")
                .description("Energetic rock vibes")
                .stations(List.of())
                .build();
        when(aiService.getMoodPlaylist("rock")).thenReturn(rockPlaylist);

        mockMvc.perform(post("/api/ai/mood")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"text\": \"rock\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Rock Session"))
                .andExpect(jsonPath("$.description").value("Energetic rock vibes"));

        verify(aiService).getMoodPlaylist("rock");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/ai/contextual
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("getContextualPlaylist: returns 200 and delegates all three parameters to AiService")
    void getContextualPlaylist_returns200AndDelegatesParameters() throws Exception {
        when(aiService.getContextualPlaylist(40.4168, -3.7038, "14:30")).thenReturn(samplePlaylist);

        mockMvc.perform(post("/api/ai/contextual")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"latitude\": 40.4168, \"longitude\": -3.7038, \"localTime\": \"14:30\"}"))
                .andExpect(status().isOk());

        verify(aiService).getContextualPlaylist(40.4168, -3.7038, "14:30");
    }

    @Test
    @DisplayName("getContextualPlaylist: response body contains title from service result")
    void getContextualPlaylist_responseTitleMatchesServiceResult() throws Exception {
        MoodPlaylist eveningPlaylist = MoodPlaylist.builder()
                .title("Evening Jazz")
                .description("Perfect for the evening")
                .stations(List.of())
                .build();
        when(aiService.getContextualPlaylist(48.8566, 2.3522, "20:00")).thenReturn(eveningPlaylist);

        mockMvc.perform(post("/api/ai/contextual")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"latitude\": 48.8566, \"longitude\": 2.3522, \"localTime\": \"20:00\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Evening Jazz"));

        verify(aiService).getContextualPlaylist(48.8566, 2.3522, "20:00");
    }

    @Test
    @DisplayName("getContextualPlaylist: works with morning time slot")
    void getContextualPlaylist_worksWithMorningTime() throws Exception {
        MoodPlaylist morningPlaylist = MoodPlaylist.builder()
                .title("Morning Boost")
                .description("Start your day right")
                .stations(List.of())
                .build();
        when(aiService.getContextualPlaylist(51.5074, -0.1278, "08:00")).thenReturn(morningPlaylist);

        mockMvc.perform(post("/api/ai/contextual")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"latitude\": 51.5074, \"longitude\": -0.1278, \"localTime\": \"08:00\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Morning Boost"));
    }
}
