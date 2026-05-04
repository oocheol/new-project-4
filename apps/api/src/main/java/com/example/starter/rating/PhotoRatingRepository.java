package com.example.starter.rating;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PhotoRatingRepository extends JpaRepository<PhotoRating, Long> {

  List<PhotoRating> findAllByPhotoId(Long photoId);

  Optional<PhotoRating> findByPhotoIdAndRaterId(Long photoId, Long raterId);
}
