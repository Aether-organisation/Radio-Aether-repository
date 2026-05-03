package com.aether.RadioAether.model.dto.request;

import java.util.List;
import lombok.Data;

/**
 * Request payload for submitting the onboarding survey results.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@Data
public class SurveyCompletedRequest {
    private List<String> favoriteGenres;
    private String gender;
}
