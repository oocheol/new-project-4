package com.example.starter.rating;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

public class AuthRequest {

  @NotBlank
  @Size(min = 3, max = 40)
  private String loginId;

  @NotBlank
  @Size(min = 4, max = 80)
  private String password;

  @Size(min = 2, max = 30)
  private String nickname;

  public String getLoginId() {
    return loginId;
  }

  public String getPassword() {
    return password;
  }

  public String getNickname() {
    return nickname;
  }
}
