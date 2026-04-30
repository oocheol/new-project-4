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
      } else if (databaseName.contains("h2")) {
        jdbcTemplate.execute("alter table portfolio_photo alter column image_url text");
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
