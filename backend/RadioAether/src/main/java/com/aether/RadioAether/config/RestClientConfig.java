package com.aether.RadioAether.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * Configuration class for REST clients.
 *
 * <p>Provides a globally available {@link RestTemplate} bean.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@Configuration
public class RestClientConfig {

    /**
     * Exposes a {@link RestTemplate} bean for making synchronous HTTP requests.
     *
     * @return a new {@link RestTemplate} instance
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
