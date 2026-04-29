package com.example.starter.wedding;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

public class BookingInquiryRequest {

  @NotBlank
  private String coupleName;

  @NotBlank
  private String phone;

  @Email
  @NotBlank
  private String email;

  @NotBlank
  private String weddingDate;

  @NotBlank
  private String preferredMood;

  @NotBlank
  @Size(max = 3000)
  private String message;

  @NotNull
  private Long photographerId;

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

  public Long getPhotographerId() {
    return photographerId;
  }
}
