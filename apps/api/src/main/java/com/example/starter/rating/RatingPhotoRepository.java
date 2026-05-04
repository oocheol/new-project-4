package com.example.starter.rating;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RatingPhotoRepository extends JpaRepository<RatingPhoto, Long> {

  List<RatingPhoto> findAllByOrderByCreatedAtDesc();

  List<RatingPhoto> findAllByOwnerIdOrderByCreatedAtDesc(Long ownerId);
}
