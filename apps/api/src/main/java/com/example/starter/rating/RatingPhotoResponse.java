package com.example.starter.rating;

import java.time.Instant;

public class RatingPhotoResponse {

  private final Long id;
  private final String title;
  private final String imageData;
  private final PhotoUserSummary owner;
  private final Instant createdAt;
  private final double averageScore;
  private final int ratingCount;
  private final Integer myScore;

  public RatingPhotoResponse(RatingPhoto photo, double averageScore, int ratingCount, Integer myScore) {
    this.id = photo.getId();
    this.title = photo.getTitle();
    this.imageData = photo.getImageData();
    this.owner = photo.getOwner();
    this.createdAt = photo.getCreatedAt();
    this.averageScore = averageScore;
    this.ratingCount = ratingCount;
    this.myScore = myScore;
  }

  public Long getId() {
    return id;
  }

  public String getTitle() {
    return title;
  }

  public String getImageData() {
    return imageData;
  }

  public PhotoUserSummary getOwner() {
    return owner;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public double getAverageScore() {
    return averageScore;
  }

  public int getRatingCount() {
    return ratingCount;
  }

  public Integer getMyScore() {
    return myScore;
  }
}
