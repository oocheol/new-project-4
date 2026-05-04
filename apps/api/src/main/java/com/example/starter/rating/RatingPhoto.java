package com.example.starter.rating;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.Instant;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.PrePersist;

@Entity
public class RatingPhoto {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 80)
  private String title;

  @Column(nullable = false, columnDefinition = "text")
  private String imageData;

  @ManyToOne(fetch = FetchType.EAGER, optional = false)
  @JoinColumn(name = "owner_id")
  private PhotoUser owner;

  @Column(nullable = false)
  private Instant createdAt;

  protected RatingPhoto() {
  }

  public RatingPhoto(String title, String imageData, PhotoUser owner) {
    this.title = title;
    this.imageData = imageData;
    this.owner = owner;
  }

  @PrePersist
  void prePersist() {
    createdAt = Instant.now();
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
    return PhotoUserSummary.from(owner);
  }

  @JsonIgnore
  public PhotoUser getOwnerEntity() {
    return owner;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }
}
