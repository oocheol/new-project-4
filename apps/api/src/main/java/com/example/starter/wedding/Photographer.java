package com.example.starter.wedding;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
public class Photographer {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String name;

  @Column(nullable = false)
  private String role;

  @Column(nullable = false, length = 1000)
  private String bio;

  @Column(nullable = false)
  private String style;

  @Column(nullable = false)
  private String location;

  @Column(nullable = false)
  private Integer experienceYears;

  @Column(nullable = false)
  private Integer startingPrice;

  @Column(nullable = false)
  private String portraitUrl;

  protected Photographer() {
  }

  public Photographer(String name, String role, String bio, String style, String location,
      Integer experienceYears, Integer startingPrice, String portraitUrl) {
    this.name = name;
    this.role = role;
    this.bio = bio;
    this.style = style;
    this.location = location;
    this.experienceYears = experienceYears;
    this.startingPrice = startingPrice;
    this.portraitUrl = portraitUrl;
  }

  public Long getId() {
    return id;
  }

  public String getName() {
    return name;
  }

  public String getRole() {
    return role;
  }

  public String getBio() {
    return bio;
  }

  public String getStyle() {
    return style;
  }

  public String getLocation() {
    return location;
  }

  public Integer getExperienceYears() {
    return experienceYears;
  }

  public Integer getStartingPrice() {
    return startingPrice;
  }

  public String getPortraitUrl() {
    return portraitUrl;
  }
}
