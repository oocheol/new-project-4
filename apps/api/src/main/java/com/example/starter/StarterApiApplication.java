package com.example.starter;

import java.net.URI;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class StarterApiApplication {

  public static void main(String[] args) {
    normalizeRenderDatabaseUrl();
    SpringApplication.run(StarterApiApplication.class, args);
  }

  private static void normalizeRenderDatabaseUrl() {
    String databaseUrl = System.getenv("DATABASE_URL");

    if (databaseUrl == null || !databaseUrl.startsWith("postgres")) {
      return;
    }

    URI uri = URI.create(databaseUrl);
    String jdbcUrl = "jdbc:postgresql://" + uri.getHost() + ":" + uri.getPort() + uri.getPath();
    String userInfo = uri.getUserInfo();

    System.setProperty("spring.datasource.url", jdbcUrl);
    if (userInfo != null && userInfo.contains(":")) {
      String[] credentials = userInfo.split(":", 2);
      System.setProperty("spring.datasource.username", credentials[0]);
      System.setProperty("spring.datasource.password", credentials[1]);
    }
  }
}
