package com.example.starter.magazine;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PhotoPageRepository extends JpaRepository<PhotoPage, Long> {
    List<PhotoPage> findAllByOrderByPageNumberAsc();
}
