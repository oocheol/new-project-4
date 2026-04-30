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

  public Photographer getPhotographer() {
    return photographer;
  }
}
