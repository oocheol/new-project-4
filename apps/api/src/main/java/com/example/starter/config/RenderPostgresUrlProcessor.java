package com.example.starter.config;

import java.util.Map;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

public class RenderPostgresUrlProcessor implements EnvironmentPostProcessor, Ordered {

  private static final String PROPERTY_SOURCE_NAME = "renderPostgresJdbcUrl";

  @Override
  public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
    String datasourceUrl = environment.getProperty("spring.datasource.url");
    String jdbcUrl = toJdbcPostgresUrl(datasourceUrl);

    if (jdbcUrl != null) {
      environment.getPropertySources().addFirst(
          new MapPropertySource(PROPERTY_SOURCE_NAME, Map.of("spring.datasource.url", jdbcUrl)));
    }
  }

  @Override
  public int getOrder() {
    return Ordered.HIGHEST_PRECEDENCE;
  }

  private String toJdbcPostgresUrl(String value) {
    if (value == null || value.isBlank() || value.startsWith("jdbc:")) {
      return null;
    }

    if (value.startsWith("postgresql://")) {
      return "jdbc:" + value;
    }

    if (value.startsWith("postgres://")) {
      return "jdbc:postgresql://" + value.substring("postgres://".length());
    }

    return null;
  }
}
