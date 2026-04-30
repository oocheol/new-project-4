package com.example.starter.config;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
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
    Map<String, Object> properties = toDatasourceProperties(datasourceUrl);

    if (!properties.isEmpty()) {
      environment.getPropertySources().addFirst(new MapPropertySource(PROPERTY_SOURCE_NAME, properties));
    }
  }

  @Override
  public int getOrder() {
    return Ordered.HIGHEST_PRECEDENCE;
  }

  private Map<String, Object> toDatasourceProperties(String value) {
    if (value == null || value.isBlank() || value.startsWith("jdbc:")) {
      return Map.of();
    }

    if (!value.startsWith("postgresql://") && !value.startsWith("postgres://")) {
      return Map.of();
    }

    URI uri = URI.create(value);
    StringBuilder jdbcUrl = new StringBuilder("jdbc:postgresql://").append(uri.getHost());
    if (uri.getPort() > -1) {
      jdbcUrl.append(":").append(uri.getPort());
    }
    if (uri.getRawPath() != null) {
      jdbcUrl.append(uri.getRawPath());
    }
    if (uri.getRawQuery() != null) {
      jdbcUrl.append("?").append(uri.getRawQuery());
    }

    Map<String, Object> properties = new HashMap<>();
    properties.put("spring.datasource.url", jdbcUrl.toString());

    String userInfo = uri.getRawUserInfo();
    if (userInfo != null && !userInfo.isBlank()) {
      String[] parts = userInfo.split(":", 2);
      properties.put("spring.datasource.username", decode(parts[0]));
      if (parts.length > 1) {
        properties.put("spring.datasource.password", decode(parts[1]));
      }
    }

    return properties;
  }

  private String decode(String value) {
    return URLDecoder.decode(value, StandardCharsets.UTF_8);
  }
}
