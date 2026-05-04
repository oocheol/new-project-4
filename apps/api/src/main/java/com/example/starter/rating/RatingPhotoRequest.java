package com.example.starter.rating;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

public class RatingPhotoRequest {

  @NotBlank
  @Size(max = 80)
  private String title;

  @NotBlank
  private String imageData;

  public String getTitle() {
    return title;
  }

  public String getImageData() {
    return imageData;
  }
}
