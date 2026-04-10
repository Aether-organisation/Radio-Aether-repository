package com.aether.RadioAether.model.dto.request;

import java.util.List;
import lombok.Data;

@Data
public class SurveyCompletedRequest {
    private List<String> favoriteGenres;
    private String gender;
}
