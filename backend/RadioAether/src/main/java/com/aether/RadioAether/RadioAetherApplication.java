package com.aether.RadioAether;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class RadioAetherApplication {

	public static void main(String[] args) {
		SpringApplication.run(RadioAetherApplication.class, args);
	}

}
