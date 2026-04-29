package com.example.starter.wedding;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PortfolioPhotoRepository extends JpaRepository<PortfolioPhoto, Long> {

  List<PortfolioPhoto> findAllByOrderByFeaturedDescIdAsc();
}
