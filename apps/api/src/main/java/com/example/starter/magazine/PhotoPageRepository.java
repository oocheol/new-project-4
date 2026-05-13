package com.example.starter.magazine;

import java.util.List;
import javax.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface PhotoPageRepository extends JpaRepository<PhotoPage, Long> {
    List<PhotoPage> findAllByOrderByPageNumberAsc();

    @Modifying
    @Transactional
    @Query("delete from PhotoPage page where page.seeded = false or page.seeded is null")
    void deleteUserCreatedRows();
}
