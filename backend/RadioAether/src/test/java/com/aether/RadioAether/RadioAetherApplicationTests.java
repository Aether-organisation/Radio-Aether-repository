package com.aether.RadioAether;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Integration test: verifies that the full Spring application context starts correctly.
 * Requires a running PostgreSQL instance at the configured datasource URL.
 * Run this test with the database up (e.g. via docker-compose) before deploying.
 */
@Disabled("Integration test — requires a running PostgreSQL instance")
@SpringBootTest
class RadioAetherApplicationTests {

	@Test
	void contextLoads() {
	}

}
