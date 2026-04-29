package com.example.starter.wedding;

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
public class BookingInquiry {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String coupleName;

  @Column(nullable = false)
  private String phone;

  @Column(nullable = false)
  private String email;

  @Column(nullable = false)
  private String weddingDate;

  @Column(nullable = false)
  private String preferredMood;

  @Column(nullable = false, length = 3000)
  private String message;

  @Column(nullable = false)
  private String status;

  @Column(nullable = false, updatable = false)
  private Instant createdAt;

  @ManyToOne(fetch = FetchType.EAGER, optional = false)
  @JoinColumn(name = "photographer_id")
  private Photographer photographer;

  protected BookingInquiry() {
  }

  public BookingInquiry(String coupleName, String phone, String email, String weddingDate,
      String preferredMood, String message, Photographer photographer) {
    this.coupleName = coupleName;
    this.phone = phone;
    this.email = email;
    this.weddingDate = weddingDate;
    this.preferredMood = preferredMood;
    this.message = message;
    this.photographer = photographer;
    this.status = "RECEIVED";
  }

  @PrePersist
  void onCreate() {
    createdAt = Instant.now();
  }

  public Long getId() {
    return id;
  }

  public String getCoupleName() {
    return coupleName;
  }

  public String getPhone() {
    return phone;
  }

  public String getEmail() {
    return email;
  }

  public String getWeddingDate() {
    return weddingDate;
  }

  public String getPreferredMood() {
    return preferredMood;
  }

  public String getMessage() {
    return message;
  }

  public String getStatus() {
    return status;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public Photographer getPhotographer() {
    return photographer;
  }
}
