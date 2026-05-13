package com.example.starter.magazine;

import java.util.List;
import javax.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface MagazineEntryRepository extends JpaRepository<MagazineEntry, Long> {
    List<MagazineEntry> findAllByOrderByCreatedAtDesc();

    @Modifying
    @Transactional
    @Query("delete from MagazineEntry entry where entry.seeded = false or entry.seeded is null")
    void deleteUserCreatedRows();
}
