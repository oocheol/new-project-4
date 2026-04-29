package com.example.starter.notes;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

public class NoteRequest {

  @NotBlank
  @Size(max = 120)
  private String title;

  @NotBlank
  @Size(max = 4000)
  private String body;

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public String getBody() {
    return body;
  }

  public void setBody(String body) {
    this.body = body;
  }
}
