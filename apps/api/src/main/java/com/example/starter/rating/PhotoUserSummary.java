package com.example.starter.rating;

public class PhotoUserSummary {

  private final Long id;
  private final String nickname;

  private PhotoUserSummary(Long id, String nickname) {
    this.id = id;
    this.nickname = nickname;
  }

  public static PhotoUserSummary from(PhotoUser user) {
    return new PhotoUserSummary(user.getId(), user.getNickname());
  }

  public Long getId() {
    return id;
  }

  public String getNickname() {
    return nickname;
  }
}
