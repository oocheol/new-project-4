package com.example.starter.wedding;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Order(0)
public class PortfolioPhotoSchemaMigration implements CommandLineRunner {

  private final JdbcTemplate jdbcTemplate;

  public PortfolioPhotoSchemaMigration(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  @Override
  public void run(String... args) {
    try {
      String databaseName = databaseName();
      if (databaseName.contains("postgresql")) {
        jdbcTemplate.execute("alter table portfolio_photo alter column image_url type text");
        jdbcTemplate.execute("alter table portfolio_photo add column if not exists view_count integer not null default 0");
        jdbcTemplate.execute(
            "alter table portfolio_photo add column if not exists recommendation_count integer not null default 0");
      } else if (databaseName.contains("h2")) {
        jdbcTemplate.execute("alter table portfolio_photo alter column image_url text");
        jdbcTemplate.execute(
            "alter table portfolio_photo add column if not exists view_count integer default 0 not null");
        jdbcTemplate.execute(
            "alter table portfolio_photo add column if not exists recommendation_count integer default 0 not null");
      }
    } catch (Exception ignored) {
      // Best-effort compatibility for existing prototype databases.
    }
  }

  private String databaseName() throws Exception {
    return jdbcTemplate.execute((Connection connection) -> {
      DatabaseMetaData metaData = connection.getMetaData();
      return metaData.getDatabaseProductName().toLowerCase();
    });
  }
}
