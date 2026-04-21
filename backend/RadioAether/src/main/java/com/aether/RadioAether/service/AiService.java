package com.aether.RadioAether.service;

import com.aether.RadioAether.model.dto.StationDTO;
import com.aether.RadioAether.model.dto.response.MoodPlaylist;
import com.aether.RadioAether.model.dto.response.MoodPlaylistResponse;
import org.springframework.ai.chat.client.ChatClient;
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

    private final ChatClient chatClient;
    private final RadioBrowserClient radioBrowserClient;

    public AiService(ChatClient.Builder chatClientBuilder, RadioBrowserClient radioBrowserClient) {
        this.chatClient = chatClientBuilder.build();
        this.radioBrowserClient = radioBrowserClient;
    }

    public MoodPlaylist getMoodPlaylist(String text) {
        try {
            MoodPlaylistResponse aiResponse = chatClient.prompt()
                    .system(MOOD_SYSTEM_PROMPT)
                    .user(text)
                    .call()
                    .entity(MoodPlaylistResponse.class);

            List<StationDTO> stations = new ArrayList<>();
            if (aiResponse.getGenres() != null) {
                for (String genre : aiResponse.getGenres()) {
                    stations.addAll(radioBrowserClient.getStationsByGenre(genre));
                    if (stations.size() >= 10) break;
                }
            }
            if (stations.size() < 5 && aiResponse.getTags() != null) {
                for (String tag : aiResponse.getTags()) {
                    stations.addAll(radioBrowserClient.getStationsByGenre(tag));
                    if (stations.size() >= 10) break;
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

        } catch (Exception e) {
            return MoodPlaylist.builder()
                    .title("Sin resultados")
                    .description(e.getMessage())
                    .stations(List.of())
                    .build();
        }
    }

    public MoodPlaylistResponse getContextualPlaylist(double latitude, double longitude, String localTime) {
        throw new UnsupportedOperationException();
    }
}
