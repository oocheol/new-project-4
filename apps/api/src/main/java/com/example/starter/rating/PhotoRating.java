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
import javax.persistence.PreUpdate;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;

@Entity
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"photo_id", "rater_id"}))
public class PhotoRating {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "photo_id")
  private RatingPhoto photo;

  @ManyToOne(fetch = FetchType.EAGER, optional = false)
  @JoinColumn(name = "rater_id")
  private PhotoUser rater;

  @Column(nullable = false)
  private Integer score;

  @Column(nullable = false)
  private Instant createdAt;

  @Column(nullable = false)
  private Instant updatedAt;

  protected PhotoRating() {
  }

  public PhotoRating(RatingPhoto photo, PhotoUser rater, Integer score) {
    this.photo = photo;
    this.rater = rater;
    this.score = score;
  }

  @PrePersist
  void prePersist() {
    Instant now = Instant.now();
    createdAt = now;
    updatedAt = now;
  }

  @PreUpdate
  void preUpdate() {
    updatedAt = Instant.now();
  }

  public Long getId() {
    return id;
  }

  @JsonIgnore
  public RatingPhoto getPhoto() {
    return photo;
  }

  public PhotoUserSummary getRater() {
    return PhotoUserSummary.from(rater);
  }

  @JsonIgnore
  public PhotoUser getRaterEntity() {
    return rater;
  }

  public Integer getScore() {
    return score;
  }

  public void setScore(Integer score) {
    this.score = score;
  }
}
