package com.aether.RadioAether.service;

import com.aether.RadioAether.model.dto.StationDTO;
import com.aether.RadioAether.model.dto.response.MoodPlaylist;
import com.aether.RadioAether.model.dto.response.MoodPlaylistResponse;
import com.aether.RadioAether.model.dto.response.WeatherContext;
import com.aether.RadioAether.model.entity.User;
import com.aether.RadioAether.repository.UserRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AiService {

    private static final String MOOD_SYSTEM_PROMPT = """
            You are a music expert AI for a radio streaming app.
            The user will describe how they feel or what they are doing.
            Your job is to translate that into radio-friendly music tags.

            Respond ONLY with a valid JSON object matching this exact structure:
            {
              "playlistTitle": "creative evocative title in the user's language",
              "playlistDescription": "2-3 sentence empathetic description in the user's language",
              "tags": ["tag1", "tag2", "tag3", "tag4"],
              "genres": ["genre1", "genre2"],
              "mood": "one word mood descriptor"
            }

            Rules:
            - Tags must be valid Radio Browser API search terms
              (e.g. lofi, jazz, rock, acoustic, ambient, sad, happy, focus, sleep, workout)
            - Generate 3-5 tags maximum
            - Generate 1-2 genres maximum
            - The title must be creative and evocative, not generic
            - The description must be empathetic and match the user's language
            - Return ONLY the JSON, no extra text
            """;

    private static final String CONTEXTUAL_SYSTEM_PROMPT = """
            You are a music expert AI for a radio streaming app.
            You will receive contextual information about the user's current situation:
            time of day, weather conditions, temperature, and their musical preferences.

            Based on this context, suggest the perfect radio playlist for this moment.

            Respond ONLY with a valid JSON object matching this exact structure:
            {
              "playlistTitle": "creative evocative title that reflects the moment",
              "playlistDescription": "2-3 sentences explaining why this music fits the moment",
              "tags": ["tag1", "tag2", "tag3"],
              "genres": ["genre1", "genre2"],
              "mood": "one word mood descriptor"
            }

            Rules:
            - Tags must be valid Radio Browser API search terms
              (e.g. lofi, jazz, rock, acoustic, ambient, chill, focus, sleep, workout)
            - Generate 3-5 tags maximum
            - Generate 1-2 genres maximum
            - The title must be poetic and evoke the atmosphere
            - Respond in Spanish
            - Return ONLY the JSON, no extra text
            """;

    // ── Dependencies ────────────────────────────────────────────────────────────

    private final ChatClient chatClient;
    private final RadioBrowserClient radioBrowserClient;
    private final WeatherService weatherService;
    private final UserRepository userRepository;

    public AiService(ChatClient.Builder chatClientBuilder,
            RadioBrowserClient radioBrowserClient,
            WeatherService weatherService,
            UserRepository userRepository) {
        this.chatClient = chatClientBuilder.build();
        this.radioBrowserClient = radioBrowserClient;
        this.weatherService = weatherService;
        this.userRepository = userRepository;
    }

    /**
     * Generates a mood-based playlist from a free-text description.
     */
    public MoodPlaylist getMoodPlaylist(String text) {
        try {
            MoodPlaylistResponse aiResponse = chatClient.prompt()
                    .system(MOOD_SYSTEM_PROMPT)
                    .user(text)
                    .call()
                    .entity(MoodPlaylistResponse.class);

            return buildPlaylist(aiResponse);

        } catch (Exception e) {
            // Gemini quota/region issue → use keyword-based fallback so the app still works
            return getFallbackPlaylist(text);
        }
    }

    /**
     * Generates a context-aware playlist combining:
     * - Current weather at the given coordinates
     * - Time-of-day slot derived from localTime
     * - Authenticated user's favourite genres (if available)
     */
    public MoodPlaylist getContextualPlaylist(double latitude, double longitude, String localTime) {
        try {
            WeatherContext weather = weatherService.getWeather(latitude, longitude);

            String timeSlot = resolveTimeSlot(localTime);

            List<String> favouriteGenres = loadCurrentUserGenres();

            String contextPrompt = buildContextPrompt(weather, timeSlot, favouriteGenres, latitude, longitude);

            MoodPlaylistResponse aiResponse = chatClient.prompt()
                    .system(CONTEXTUAL_SYSTEM_PROMPT)
                    .user(contextPrompt)
                    .call()
                    .entity(MoodPlaylistResponse.class);

            return buildPlaylist(aiResponse);

        } catch (Exception e) {
            return errorPlaylist(e.getMessage());
        }
    }

    /**
     * Resolves the localTime string ("HH:mm" or "HH:mm:ss") into a human-readable
     * time-of-day slot that the AI can reason about.
     */
    private String resolveTimeSlot(String localTime) {
        try {
            int hour = Integer.parseInt(localTime.split(":")[0]);
            if (hour >= 5 && hour < 12)
                return "morning";
            if (hour >= 12 && hour < 14)
                return "midday";
            if (hour >= 14 && hour < 18)
                return "afternoon";
            if (hour >= 18 && hour < 21)
                return "evening";
            if (hour >= 21 || hour < 5)
                return "night";
        } catch (Exception ignored) {
            /* malformed input → fallback */ }
        return "daytime";
    }

    /**
     * Loads the favourite genres of the currently authenticated user.
     * Returns an empty list for anonymous requests (contextual playlist is public).
     */
    private List<String> loadCurrentUserGenres() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                return List.of();
            }
            String email = auth.getName();
            return userRepository.findByEmail(email)
                    .map(User::getPreferences)
                    .map(prefs -> prefs != null ? prefs.getFavoriteGenres() : List.<String>of())
                    .orElse(List.of());
        } catch (Exception e) {
            return List.of();
        }
    }

    /**
     * Builds the natural-language context string that is sent to Gemini as the
     * "user" message — the richer this is, the better the recommendation.
     */
    private String buildContextPrompt(WeatherContext weather,
            String timeSlot,
            List<String> favouriteGenres,
            double latitude,
            double longitude) {
        StringBuilder sb = new StringBuilder();
        sb.append("Current context:\n");
        sb.append("- Time of day: ").append(timeSlot).append("\n");
        sb.append("- Weather: ").append(weather.getCondition()).append("\n");
        sb.append("- Temperature: ").append(String.format("%.1f", weather.getTemperature())).append("°C\n");
        sb.append("- Approximate location: lat=").append(String.format("%.2f", latitude))
                .append(", lon=").append(String.format("%.2f", longitude)).append("\n");
        if (!favouriteGenres.isEmpty()) {
            sb.append("- User's favourite genres: ").append(String.join(", ", favouriteGenres)).append("\n");
        } else {
            sb.append("- User has no saved genre preferences; suggest something universally enjoyable.\n");
        }
        sb.append("\nGiven the above, recommend the perfect radio playlist for this exact moment.");
        return sb.toString();
    }

    /**
     * Shared station-fetching logic used by both getMoodPlaylist and
     * getContextualPlaylist.
     * Prioritises genres first, falls back to tags if not enough stations are
     * found.
     */
    private MoodPlaylist buildPlaylist(MoodPlaylistResponse aiResponse) {
        List<StationDTO> stations = new ArrayList<>();

        if (aiResponse.getGenres() != null) {
            for (String genre : aiResponse.getGenres()) {
                stations.addAll(radioBrowserClient.getStationsByGenre(genre));
                if (stations.size() >= 10)
                    break;
            }
        }
        if (stations.size() < 5 && aiResponse.getTags() != null) {
            for (String tag : aiResponse.getTags()) {
                stations.addAll(radioBrowserClient.getStationsByGenre(tag));
                if (stations.size() >= 10)
                    break;
            }
        }

        List<StationDTO> finalStations = stations.stream()
                .collect(Collectors.toMap(
                        StationDTO::getId,
                        s -> s,
                        (s1, s2) -> s1,
                        LinkedHashMap::new))
                .values().stream()
                .limit(10)
                .collect(Collectors.toList());

        return MoodPlaylist.builder()
                .title(aiResponse.getPlaylistTitle())
                .description(aiResponse.getPlaylistDescription())
                .stations(finalStations)
                .build();
    }

    private MoodPlaylist errorPlaylist(String message) {
        return MoodPlaylist.builder()
                .title("Sin resultados")
                .description(message)
                .stations(List.of())
                .build();
    }

    /**
     * Keyword-based fallback: works without Gemini.
     * Extracts genre hints from the text and queries RadioBrowser directly.
     * Shown when the AI quota/region is not available.
     */
    private MoodPlaylist getFallbackPlaylist(String text) {
        String lower = text.toLowerCase();
        List<String> tags = new ArrayList<>();

        if (lower.contains("estudiar") || lower.contains("concentra") || lower.contains("focus")) tags.add("lofi");
        if (lower.contains("relax") || lower.contains("descansar") || lower.contains("calma"))   tags.add("chillout");
        if (lower.contains("noche") || lower.contains("dormir") || lower.contains("ambient"))    tags.add("ambient");
        if (lower.contains("rock") || lower.contains("guitarra") || lower.contains("metal"))     tags.add("rock");
        if (lower.contains("feliz") || lower.contains("alegre") || lower.contains("fiesta"))     tags.add("pop");
        if (lower.contains("jazz") || lower.contains("blues") || lower.contains("soul"))         tags.add("jazz");
        if (lower.contains("clasica") || lower.contains("clásica") || lower.contains("orquest")) tags.add("classical");
        if (lower.contains("electronica") || lower.contains("electrónica") || lower.contains("dance")) tags.add("electronic");

        if (tags.isEmpty()) tags.add("chill");

        List<StationDTO> stations = new ArrayList<>();
        for (String tag : tags) {
            stations.addAll(radioBrowserClient.getStationsByGenre(tag));
            if (stations.size() >= 8) break;
        }

        List<StationDTO> finalStations = stations.stream()
                .collect(Collectors.toMap(StationDTO::getId, s -> s, (s1, s2) -> s1, LinkedHashMap::new))
                .values().stream().limit(8).collect(Collectors.toList());

        return MoodPlaylist.builder()
                .title("Selección para: " + text)
                .description("Hemos seleccionado estas emisoras que encajan con tu estado de ánimo.")
                .stations(finalStations)
                .build();
    }
}
