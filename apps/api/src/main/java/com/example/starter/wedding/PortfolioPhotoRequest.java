package com.example.starter.wedding;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

public class PortfolioPhotoRequest {

  @NotBlank
  private String title;

  @NotBlank
  private String mood;

  @NotBlank
  private String venue;

  @NotBlank
  private String season;

  @NotBlank
  private String imageUrl;

  private Boolean featured = false;

  @NotNull
  private Long photographerId;

  public String getTitle() {
    return title;
  }

  public String getMood() {
    return mood;
  }

  public String getVenue() {
    return venue;
  }

  public String getSeason() {
    return season;
  }

  public String getImageUrl() {
    return imageUrl;
  }

  public Boolean getFeatured() {
    return featured;
  }

  public Long getPhotographerId() {
    return photographerId;
  }
}
