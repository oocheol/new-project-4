package com.example.starter.rating;

public class AuthResponse {

  private final String token;
  private final PhotoUserSummary user;

  public AuthResponse(String token, PhotoUser user) {
    this.token = token;
    this.user = PhotoUserSummary.from(user);
  }

  public String getToken() {
    return token;
  }

  public PhotoUserSummary getUser() {
    return user;
  }
}
