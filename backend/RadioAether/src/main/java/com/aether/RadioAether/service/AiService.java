package com.aether.RadioAether.service;

import com.aether.RadioAether.model.dto.response.MoodPlaylistResponse;
import org.springframework.stereotype.Service;

@Service
public class AiService {

    public MoodPlaylistResponse getMoodPlaylist(String text) {
        throw new UnsupportedOperationException();
    }

    public MoodPlaylistResponse getContextualPlaylist(double latitude, double longitude, String localTime) {
        throw new UnsupportedOperationException();
    }
}
