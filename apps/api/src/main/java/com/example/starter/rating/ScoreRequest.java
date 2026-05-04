package com.example.starter.rating;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;

public class ScoreRequest {

  @NotNull
  @Min(1)
  @Max(5)
  private Integer score;

  public Integer getScore() {
    return score;
  }
}
