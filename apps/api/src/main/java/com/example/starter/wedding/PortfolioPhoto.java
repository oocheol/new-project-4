package com.example.starter.wedding;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

@Entity
public class PortfolioPhoto {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String title;

  @Column(nullable = false)
  private String mood;

  @Column(nullable = false)
  private String venue;

  @Column(nullable = false)
  private String season;

  @Column(nullable = false, columnDefinition = "text")
  private String imageUrl;

  @Column(nullable = false)
  private Boolean featured;

  @Column(nullable = false)
  private Integer viewCount = 0;

  @Column(nullable = false)
  private Integer recommendationCount = 0;

  @ManyToOne(fetch = FetchType.EAGER, optional = false)
  @JoinColumn(name = "photographer_id")
  private Photographer photographer;

  protected PortfolioPhoto() {
  }

  public PortfolioPhoto(String title, String mood, String venue, String season, String imageUrl,
      Boolean featured, Photographer photographer) {
    this.title = title;
    this.mood = mood;
    this.venue = venue;
    this.season = season;
    this.imageUrl = imageUrl;
    this.featured = featured;
    this.photographer = photographer;
    this.viewCount = 0;
    this.recommendationCount = 0;
  }

  public Long getId() {
    return id;
  }

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

  public Integer getViewCount() {
    return viewCount;
  }

  public Integer getRecommendationCount() {
    return recommendationCount;
  }

  public Photographer getPhotographer() {
    return photographer;
  }

  public void incrementViewCount() {
    viewCount = safeCount(viewCount) + 1;
  }

  public void incrementRecommendationCount() {
    recommendationCount = safeCount(recommendationCount) + 1;
  }

  private Integer safeCount(Integer value) {
    return value == null ? 0 : value;
  }
}
