package com.aether.RadioAether;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main application class for Radio Aether.
 *
 * <p>Bootstraps the Spring Boot context and enables scheduled tasks.
 *
 * @author prorix
 * @author mahoramas
 * @version 1.0.0
 */
@SpringBootApplication
@EnableScheduling
public class RadioAetherApplication {

    /**
     * Entry point of the application.
     *
     * @param args command-line arguments
     */

	public static void main(String[] args) {
		SpringApplication.run(RadioAetherApplication.class, args);
	}

}
