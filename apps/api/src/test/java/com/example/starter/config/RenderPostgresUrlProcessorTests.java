package com.example.starter.config;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.boot.SpringApplication;
import org.springframework.mock.env.MockEnvironment;

class RenderPostgresUrlProcessorTests {

  private final RenderPostgresUrlProcessor processor = new RenderPostgresUrlProcessor();

  @Test
  void convertsRenderPostgresqlUrlToJdbcUrl() {
    MockEnvironment environment = new MockEnvironment()
        .withProperty("spring.datasource.url", "postgresql://user:pass@host:5432/database");

    processor.postProcessEnvironment(environment, new SpringApplication());

    assertThat(environment.getProperty("spring.datasource.url"))
        .isEqualTo("jdbc:postgresql://user:pass@host:5432/database");
  }

  @Test
  void convertsPostgresUrlToJdbcUrl() {
    MockEnvironment environment = new MockEnvironment()
        .withProperty("spring.datasource.url", "postgres://user:pass@host:5432/database");

    processor.postProcessEnvironment(environment, new SpringApplication());

    assertThat(environment.getProperty("spring.datasource.url"))
        .isEqualTo("jdbc:postgresql://user:pass@host:5432/database");
  }

  @Test
  void keepsExistingJdbcUrl() {
    MockEnvironment environment = new MockEnvironment()
        .withProperty("spring.datasource.url", "jdbc:postgresql://host:5432/database");

    processor.postProcessEnvironment(environment, new SpringApplication());

    assertThat(environment.getProperty("spring.datasource.url"))
        .isEqualTo("jdbc:postgresql://host:5432/database");
  }
}
