package com.example.starter.magazine;

public class AuthResponse {
    private final String token;
    private final UserProfile user;

    public AuthResponse(String token, MagazineUser user) {
        this.token = token;
        this.user = new UserProfile(user);
    }

    public String getToken() {
        return token;
    }

    public UserProfile getUser() {
        return user;
    }

    public static class UserProfile {
        private final Long id;
        private final String nickname;
        private final String loginId;
        private final String profileImageUrl;

        public UserProfile(MagazineUser user) {
            this.id = user.getId();
            this.nickname = user.getNickname();
            this.loginId = user.getLoginId();
            this.profileImageUrl = user.getProfileImageUrl();
        }

        public Long getId() {
            return id;
        }

        public String getNickname() {
            return nickname;
        }

        public String getLoginId() {
            return loginId;
        }

        public String getProfileImageUrl() {
            return profileImageUrl;
        }
    }
}
