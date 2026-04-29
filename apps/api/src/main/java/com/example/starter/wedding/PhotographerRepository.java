package com.example.starter.wedding;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PhotographerRepository extends JpaRepository<Photographer, Long> {

  List<Photographer> findAllByOrderByNameAsc();
}
