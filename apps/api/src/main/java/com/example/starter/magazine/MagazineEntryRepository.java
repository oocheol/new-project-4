package com.example.starter.magazine;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MagazineEntryRepository extends JpaRepository<MagazineEntry, Long> {
    List<MagazineEntry> findAllByOrderByCreatedAtDesc();
}
