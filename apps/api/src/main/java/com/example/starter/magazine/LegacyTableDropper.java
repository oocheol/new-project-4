package com.example.starter.magazine;

import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Order(10)
public class LegacyTableDropper implements CommandLineRunner {
    private final JdbcTemplate jdbcTemplate;

    public LegacyTableDropper(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        List<String> legacyTables = List.of(
                "booking_inquiry",
                "photographer",
                "portfolio_photo",
                "note",
                "photo_rating",
                "photo_user",
                "rating_photo");

        for (String table : legacyTables) {
            jdbcTemplate.execute("DROP TABLE IF EXISTS " + table + " CASCADE");
        }
    }
}
